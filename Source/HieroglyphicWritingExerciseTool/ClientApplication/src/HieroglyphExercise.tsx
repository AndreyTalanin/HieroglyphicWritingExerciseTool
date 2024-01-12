import { Button, Card, Checkbox, Form, InputNumber, Select, Space, Table, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { generateHieroglyphExercise, getDefaultExerciseSize, processExerciseStatistics } from "./api/requests";
import { ExerciseStatistics } from "./entities/ExerciseStatistics";
import { HieroglyphProperties } from "./entities/HieroglyphProperties";
import { HieroglyphModel } from "./models/HieroglyphModel";
import { ProcessExerciseStatisticsRequest } from "./models/ProcessExerciseStatisticsRequest";

import styles from "./HieroglyphExercise.module.css";

type ExerciseMode = "type" | "type-pronunciation" | "character" | "character-pronunciation" | "full-description";

const defaultExerciseSize: number = 36;
const defaultExerciseMode: ExerciseMode = "character";
const defaultHieroglyphProperties: HieroglyphProperties = HieroglyphProperties.Pronunciation | HieroglyphProperties.Syllable;

interface ExerciseConfiguration {
  useKanji: boolean;
  useKanjiOnly: boolean;
  size: number;
  mode: ExerciseMode;
}

interface HieroglyphRecord extends HieroglyphModel {
  index: number;
  peeked: boolean;
  displayed: boolean;
  completed: boolean;
}

const HieroglyphExercise = () => {
  const [mode, setMode] = useState<ExerciseMode>(defaultExerciseMode);
  const [startedOn, setStartedOn] = useState<Date>(new Date());
  const [hieroglyphs, setHieroglyphs] = useState<HieroglyphModel[]>([]);
  const [hieroglyphProperties, setHieroglyphProperties] = useState<HieroglyphProperties>(defaultHieroglyphProperties);
  const [peekedIndexes, setPeekedIndexes] = useState<Set<number>>(new Set<number>());
  const [displayedIndexes, setDisplayedIndexes] = useState<Set<number>>(new Set<number>());
  const [completedIndexes, setCompletedIndexes] = useState<Set<number>>(new Set<number>());
  const [completed, setCompleted] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<ExerciseStatistics>();
  const [initialExerciseConfiguration, setInitialExerciseConfiguration] = useState<ExerciseConfiguration>({
    useKanji: false,
    useKanjiOnly: false,
    size: defaultExerciseSize,
    mode: defaultExerciseMode,
  });

  const [exerciseConfigurationForm] = Form.useForm<ExerciseConfiguration>();

  const hieroglyphsTotal = useMemo(() => hieroglyphs.length, [hieroglyphs]);
  const hieroglyphsTotalDivisionSafe = useMemo(() => (hieroglyphsTotal > 0 ? hieroglyphsTotal : 1), [hieroglyphsTotal]);
  const hieroglyphsPeeked = useMemo(() => peekedIndexes.size, [peekedIndexes]);
  const hieroglyphsCompleted = useMemo(() => completedIndexes.size, [completedIndexes]);

  const hiddenProperties = useMemo(() => {
    if (mode === "type") {
      return HieroglyphProperties.Type;
    } else if (mode === "type-pronunciation") {
      return HieroglyphProperties.Type | HieroglyphProperties.Onyomi | HieroglyphProperties.Kunyomi | HieroglyphProperties.Pronunciation;
    } else if (mode === "character") {
      return HieroglyphProperties.Character;
    } else if (mode === "character-pronunciation") {
      return HieroglyphProperties.Character | HieroglyphProperties.Onyomi | HieroglyphProperties.Kunyomi | HieroglyphProperties.Pronunciation;
    } else {
      /* if (mode === "full-description") */
      return (
        HieroglyphProperties.Type |
        HieroglyphProperties.Onyomi |
        HieroglyphProperties.Kunyomi |
        HieroglyphProperties.Pronunciation |
        HieroglyphProperties.Syllable |
        HieroglyphProperties.Meaning
      );
    }
  }, [mode]);

  const hieroglyphRecords = useMemo(() => {
    return hieroglyphs.map((hieroglyph, index) => {
      const record = {
        index: index,
        peeked: peekedIndexes.has(index),
        displayed: displayedIndexes.has(index),
        completed: completedIndexes.has(index),
        ...hieroglyph,
      };

      if (hiddenProperties & HieroglyphProperties.Type && !(record.peeked || record.displayed)) {
        record.type = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Character && !(record.peeked || record.displayed)) {
        record.character = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Pronunciation && !(record.peeked || record.displayed)) {
        record.pronunciation = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Onyomi && !(record.peeked || record.displayed)) {
        record.onyomi = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Kunyomi && !(record.peeked || record.displayed)) {
        record.kunyomi = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Syllable && !(record.peeked || record.displayed)) {
        record.syllable = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Meaning && !(record.peeked || record.displayed)) {
        record.meaning = "???";
      }

      return record;
    });
  }, [hieroglyphs, peekedIndexes, displayedIndexes, completedIndexes, hiddenProperties]);

  const onGenerateButtonClick = useCallback(() => {
    exerciseConfigurationForm.submit();
  }, [exerciseConfigurationForm]);

  const onResetButtonClick = useCallback(() => {
    setStartedOn(new Date());
    setHieroglyphs([]);
    setHieroglyphProperties(defaultHieroglyphProperties);
    setPeekedIndexes(new Set<number>());
    setDisplayedIndexes(new Set<number>());
    setCompletedIndexes(new Set<number>());
    setCompleted(false);
    setStatistics(undefined);
    exerciseConfigurationForm.resetFields();
  }, [exerciseConfigurationForm]);

  const onCompleteCheckboxChanged = useCallback(
    (index: number, checked: boolean) => {
      if (checked) {
        setCompletedIndexes(new Set<number>([...Array.from(completedIndexes.values()), index]));
      } else {
        setCompletedIndexes(new Set<number>(Array.from(completedIndexes.values()).filter((keyToCompare) => index !== keyToCompare)));
      }
    },
    [completedIndexes]
  );

  const onPeekButtonClick = useCallback(
    (index: number) => {
      setPeekedIndexes(new Set<number>([...Array.from(peekedIndexes.values()), index]));
      setDisplayedIndexes(new Set<number>(Array.from(displayedIndexes.values()).filter((keyToCompare) => index !== keyToCompare)));
      onCompleteCheckboxChanged(index, true);
    },
    [peekedIndexes, displayedIndexes, onCompleteCheckboxChanged]
  );

  const onDisplayButtonClick = useCallback(
    (index: number) => {
      setDisplayedIndexes(new Set<number>([...Array.from(displayedIndexes.values()), index]));
      onCompleteCheckboxChanged(index, true);
    },
    [displayedIndexes, onCompleteCheckboxChanged]
  );

  useEffect(() => {
    getDefaultExerciseSize()
      .then((response) => {
        setInitialExerciseConfiguration((initialExerciseConfiguration) => ({ ...initialExerciseConfiguration, size: response.defaultExerciseSize }));
      })
      .catch();
  }, [exerciseConfigurationForm]);

  useEffect(() => exerciseConfigurationForm.resetFields(), [initialExerciseConfiguration, exerciseConfigurationForm]);

  useEffect(() => {
    if (!completed && hieroglyphsTotal === hieroglyphsCompleted && hieroglyphsTotal !== 0) {
      setCompleted(true);
      const completedOn = new Date();
      const request: ProcessExerciseStatisticsRequest = {
        exerciseSize: hieroglyphsTotal,
        totalTimeMilliseconds: completedOn.getTime() - startedOn.getTime(),
        key: `hieroglyph-exercise-${mode}`,
        writeStatistics: hieroglyphsPeeked === 0,
      };
      processExerciseStatistics(request).then((response) => {
        window.location.href = "#hieroglyphExerciseResultsCard";
        setStatistics({
          currentTimeMilliseconds: response.currentTimeMilliseconds,
          averageTimeMilliseconds: response.averageTimeMilliseconds,
          minTimeMilliseconds: response.minTimeMilliseconds,
          maxTimeMilliseconds: response.maxTimeMilliseconds,
        });
      });
    }
  }, [mode, startedOn, completed, hieroglyphsTotal, hieroglyphsPeeked, hieroglyphsCompleted]);

  const onBackToTopButtonClick = useCallback(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const onFormFinish = (exerciseConfiguration: ExerciseConfiguration) => {
    const { useKanji, useKanjiOnly, size, mode } = exerciseConfiguration;
    generateHieroglyphExercise({
      useKanji: useKanji || useKanjiOnly,
      useKanjiOnly: useKanjiOnly,
      size: size,
    }).then((response) => {
      setMode(mode);
      setStartedOn(new Date());
      setHieroglyphs(response.hieroglyphs);
      setHieroglyphProperties(
        HieroglyphProperties.None |
          (response.useKanjiColumns ? HieroglyphProperties.Onyomi | HieroglyphProperties.Kunyomi | HieroglyphProperties.Meaning : HieroglyphProperties.None) |
          (response.useKanjiColumnsOnly ? HieroglyphProperties.None : HieroglyphProperties.Pronunciation | HieroglyphProperties.Syllable)
      );
      setPeekedIndexes(new Set<number>());
      setDisplayedIndexes(new Set<number>());
      setCompletedIndexes(new Set<number>());
      setCompleted(false);
      setStatistics(undefined);
    });
  };

  const onFormFinishFailed = () => {
    alert("Form validation failed.");
  };

  const columns = useMemo(
    () => [
      {
        key: "index",
        title: "#",
        dataIndex: "index",
        render: (index: number) => 1 + index,
      },
      {
        key: "character",
        title: "Character",
        dataIndex: "character",
      },
      {
        key: "type",
        title: "Type",
        dataIndex: "type",
      },
      ...(hieroglyphProperties & HieroglyphProperties.Onyomi
        ? [
            {
              key: "onyomi",
              title: "Onyomi",
              dataIndex: "onyomi",
              render: (onyomi?: string) => onyomi ?? <Typography.Text type="secondary">N/A</Typography.Text>,
            },
          ]
        : []),
      ...(hieroglyphProperties & HieroglyphProperties.Kunyomi
        ? [
            {
              key: "kunyomi",
              title: "Kunyomi",
              dataIndex: "kunyomi",
              render: (kunyomi?: string) => kunyomi ?? <Typography.Text type="secondary">N/A</Typography.Text>,
            },
          ]
        : []),
      ...(hieroglyphProperties & HieroglyphProperties.Pronunciation
        ? [
            {
              key: "pronunciation",
              title: "Pronunciation",
              dataIndex: "pronunciation",
              render: (pronunciation?: string) => pronunciation ?? <Typography.Text type="secondary">N/A</Typography.Text>,
            },
          ]
        : []),
      ...(hieroglyphProperties & HieroglyphProperties.Syllable
        ? [
            {
              key: "syllable",
              title: "Syllable (?)",
              dataIndex: "syllable",
              render: (syllable?: string) => syllable ?? <Typography.Text type="secondary">N/A</Typography.Text>,
            },
          ]
        : []),
      ...(hieroglyphProperties & HieroglyphProperties.Meaning
        ? [
            {
              key: "meaning",
              title: "Meaning (?)",
              dataIndex: "meaning",
              render: (meaning?: string) => meaning ?? <Typography.Text type="secondary">N/A</Typography.Text>,
            },
          ]
        : []),
      {
        key: "action",
        title: "Action",
        render: (_: any, record: HieroglyphRecord) => (
          <Space wrap direction="horizontal" align="baseline">
            <Button size="small" disabled={record.peeked} onClick={() => onPeekButtonClick(record.index)} danger>
              Peek
            </Button>
            <Button size="small" disabled={record.peeked || record.displayed} onClick={() => onDisplayButtonClick(record.index)}>
              Display
            </Button>
            <Checkbox disabled={completed} checked={record.completed} onChange={(e) => onCompleteCheckboxChanged(record.index, e.target.checked)}>
              Complete
            </Checkbox>
          </Space>
        ),
      },
    ],
    [completed, hieroglyphProperties, onPeekButtonClick, onDisplayButtonClick, onCompleteCheckboxChanged]
  );

  const statisticsParagraph = useMemo(() => {
    if (statistics === undefined) {
      return undefined;
    }

    let text = "";
    if (statistics.currentTimeMilliseconds < statistics.minTimeMilliseconds) {
      text = `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is the new min value! `;
    } else if (statistics.currentTimeMilliseconds > statistics.maxTimeMilliseconds) {
      text = `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is the new max value! `;
    } else if (statistics.currentTimeMilliseconds < statistics.averageTimeMilliseconds - 0.05) {
      text = `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is below average. `;
    } else if (statistics.currentTimeMilliseconds > statistics.averageTimeMilliseconds + 0.05) {
      text = `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is above average. `;
    } else {
      text = `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is the average value. `;
    }

    text +=
      `Avg: ${statistics.averageTimeMilliseconds.toFixed(2)} ms, ` +
      `Min: ${statistics.minTimeMilliseconds.toFixed(2)} ms, ` +
      `Max: ${statistics.maxTimeMilliseconds.toFixed(2)} ms.`;

    return <p>{text}</p>;
  }, [statistics]);

  return (
    <>
      <Card
        size="small"
        title={
          <Space wrap className={styles.cardHeader} direction="horizontal" align="baseline">
            <Space wrap direction="horizontal" align="baseline">
              Exercise Configuration
            </Space>
            <Space wrap direction="horizontal" align="baseline">
              <Button type="primary" size="small" onClick={onGenerateButtonClick}>
                Generate
              </Button>
              <Button type="primary" size="small" onClick={onResetButtonClick} danger>
                Reset
              </Button>
            </Space>
          </Space>
        }
      >
        <Form
          form={exerciseConfigurationForm}
          initialValues={initialExerciseConfiguration}
          onFinish={onFormFinish}
          onFinishFailed={onFormFinishFailed}
          size="small"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          className={styles.form}
        >
          <Form.Item name="useKanji" valuePropName="checked" label="Use Kanji">
            <Checkbox />
          </Form.Item>
          <Form.Item name="useKanjiOnly" valuePropName="checked" label="Use Kanji Only">
            <Checkbox />
          </Form.Item>
          <Form.Item name="size" label="Size">
            <InputNumber />
          </Form.Item>
          <Form.Item name="mode" label="Mode">
            <Select placeholder="Select a mode">
              <Select.Option value="type">Type</Select.Option>
              <Select.Option value="type-pronunciation">Type & Pronunciation</Select.Option>
              <Select.Option value="character">Character</Select.Option>
              <Select.Option value="character-pronunciation">Character & Pronunciation</Select.Option>
              <Select.Option value="full-description">Full Description</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
      <Table dataSource={hieroglyphRecords} rowKey="index" columns={columns} pagination={false} size="small" />
      <Card
        id="hieroglyphExerciseResultsCard"
        size="small"
        title={
          <Space wrap className={styles.cardHeader} direction="horizontal" align="baseline">
            <Space wrap direction="horizontal" align="baseline">
              Exercise Results
            </Space>
            <Space wrap direction="horizontal" align="baseline">
              <Button type="primary" size="small" onClick={onBackToTopButtonClick}>
                Back To Top
              </Button>
            </Space>
          </Space>
        }
      >
        <p>
          Hieroglyphs peeked: {hieroglyphsPeeked} of {hieroglyphsTotal} ({((100 * hieroglyphsPeeked) / hieroglyphsTotalDivisionSafe).toFixed(2)} %).
        </p>
        <p>
          Hieroglyphs completed: {hieroglyphsCompleted} of {hieroglyphsTotal} ({((100 * hieroglyphsCompleted) / hieroglyphsTotalDivisionSafe).toFixed(2)} %).
        </p>
        {statistics && statisticsParagraph}
      </Card>
    </>
  );
};

export default HieroglyphExercise;
