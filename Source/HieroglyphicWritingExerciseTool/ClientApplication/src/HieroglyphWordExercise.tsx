import { Button, Card, Checkbox, Form, InputNumber, Select, Space, Table } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { generateHieroglyphWordExercise, getDefaultExerciseSize, processExerciseStatistics } from "./api/requests";
import { ExerciseStatistics } from "./entities/ExerciseStatistics";
import { HieroglyphWordProperties } from "./entities/HieroglyphWordProperties";
import { HieroglyphWordModel } from "./models/HieroglyphWordModel";
import { ProcessExerciseStatisticsRequest } from "./models/ProcessExerciseStatisticsRequest";

import styles from "./HieroglyphWordExercise.module.css";

type ExerciseMode = "type" | "type-pronunciation" | "characters" | "characters-pronunciation" | "full-description";

const defaultExerciseMode: ExerciseMode = "characters";

interface ExerciseConfiguration {
  size: number;
  mode: ExerciseMode;
}

interface HieroglyphWordRecord extends HieroglyphWordModel {
  index: number;
  peeked: boolean;
  displayed: boolean;
  completed: boolean;
}

const HieroglyphWordExercise = () => {
  const [mode, setMode] = useState<ExerciseMode>(defaultExerciseMode);
  const [startedOn, setStartedOn] = useState<Date>(new Date());
  const [hieroglyphWords, setHieroglyphWords] = useState<HieroglyphWordModel[]>([]);
  const [peekedIndexes, setPeekedIndexes] = useState<Set<number>>(new Set<number>());
  const [displayedIndexes, setDisplayedIndexes] = useState<Set<number>>(new Set<number>());
  const [completedIndexes, setCompletedIndexes] = useState<Set<number>>(new Set<number>());
  const [completed, setCompleted] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<ExerciseStatistics>();
  const [initialExerciseConfiguration, setInitialExerciseConfiguration] = useState<ExerciseConfiguration>({
    size: 36,
    mode: defaultExerciseMode,
  });

  const [exerciseConfigurationForm] = Form.useForm<ExerciseConfiguration>();

  const hieroglyphWordsTotal = useMemo(() => hieroglyphWords.length, [hieroglyphWords]);
  const hieroglyphWordsTotalDivisionSafe = useMemo(() => (hieroglyphWordsTotal > 0 ? hieroglyphWordsTotal : 1), [hieroglyphWordsTotal]);
  const hieroglyphWordsPeeked = useMemo(() => peekedIndexes.size, [peekedIndexes]);
  const hieroglyphWordsCompleted = useMemo(() => completedIndexes.size, [completedIndexes]);

  const hiddenProperties = useMemo(() => {
    if (mode === "type") {
      return HieroglyphWordProperties.Type;
    } else if (mode === "type-pronunciation") {
      return HieroglyphWordProperties.Type | HieroglyphWordProperties.Pronunciation;
    } else if (mode === "characters") {
      return HieroglyphWordProperties.Characters;
    } else if (mode === "characters-pronunciation") {
      return HieroglyphWordProperties.Characters | HieroglyphWordProperties.Pronunciation;
    } else {
      /* if (mode === "full-description") */
      return HieroglyphWordProperties.Type | HieroglyphWordProperties.Pronunciation | HieroglyphWordProperties.Meaning;
    }
  }, [mode]);

  const hieroglyphWordRecords = useMemo(() => {
    return hieroglyphWords.map((hieroglyphWord, index) => {
      const record = {
        index: index,
        peeked: peekedIndexes.has(index),
        displayed: peekedIndexes.has(index) || displayedIndexes.has(index),
        completed: completedIndexes.has(index),
        ...hieroglyphWord,
      };

      if (hiddenProperties & HieroglyphWordProperties.Type && !(record.peeked || record.displayed)) {
        record.type = "???";
      }
      if (hiddenProperties & HieroglyphWordProperties.Characters && !(record.peeked || record.displayed)) {
        record.characters = "???";
      }
      if (hiddenProperties & HieroglyphWordProperties.Pronunciation && !(record.peeked || record.displayed)) {
        record.pronunciation = "???";
      }
      if (hiddenProperties & HieroglyphWordProperties.Meaning && !(record.peeked || record.displayed)) {
        record.meaning = "???";
      }

      return record;
    });
  }, [hieroglyphWords, peekedIndexes, displayedIndexes, completedIndexes, hiddenProperties]);

  const onGenerateButtonClick = useCallback(() => {
    exerciseConfigurationForm.submit();
  }, [exerciseConfigurationForm]);

  const onResetButtonClick = useCallback(() => {
    setStartedOn(new Date());
    setHieroglyphWords([]);
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
    if (!completed && hieroglyphWordsTotal === hieroglyphWordsCompleted && hieroglyphWordsTotal !== 0) {
      setCompleted(true);
      const completedOn = new Date();
      const request: ProcessExerciseStatisticsRequest = {
        exerciseSize: hieroglyphWordsTotal,
        totalTimeMilliseconds: completedOn.getTime() - startedOn.getTime(),
        key: `hieroglyph-word-exercise-${mode}`,
        writeStatistics: hieroglyphWordsPeeked === 0,
      };
      processExerciseStatistics(request).then((response) => {
        window.location.href = "#hieroglyphWordExerciseResultsCard";
        setStatistics({
          currentTimeMilliseconds: response.currentTimeMilliseconds,
          averageTimeMilliseconds: response.averageTimeMilliseconds,
          minTimeMilliseconds: response.minTimeMilliseconds,
          maxTimeMilliseconds: response.maxTimeMilliseconds,
        });
      });
    }
  }, [mode, startedOn, completed, hieroglyphWordsTotal, hieroglyphWordsPeeked, hieroglyphWordsCompleted]);

  const onBackToTopButtonClick = useCallback(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const onFormFinish = (exerciseConfiguration: ExerciseConfiguration) => {
    const { size, mode } = exerciseConfiguration;
    generateHieroglyphWordExercise({ size: size }).then((response) => {
      setMode(mode);
      setStartedOn(new Date());
      setHieroglyphWords(response.hieroglyphWords);
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
        key: "characters",
        title: "Characters",
        dataIndex: "characters",
      },
      {
        key: "type",
        title: "Type",
        dataIndex: "type",
      },
      {
        key: "pronunciation",
        title: "Pronunciation",
        dataIndex: "pronunciation",
      },
      {
        key: "meaning",
        title: "Meaning",
        dataIndex: "meaning",
      },
      {
        key: "action",
        title: "Action",
        render: (_: any, record: HieroglyphWordRecord) => (
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
    [completed, onPeekButtonClick, onDisplayButtonClick, onCompleteCheckboxChanged]
  );

  const statisticsParagraph = useMemo(() => {
    if (statistics === undefined) {
      return undefined;
    }

    let text = "";
    if (statistics.currentTimeMilliseconds < statistics.minTimeMilliseconds) {
      text =
        `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is the new min value! ` +
        `Avg: ${statistics.averageTimeMilliseconds.toFixed(2)} ms, ` +
        `Min: ${statistics.minTimeMilliseconds.toFixed(2)} ms, ` +
        `Max: ${statistics.maxTimeMilliseconds.toFixed(2)} ms.`;
    } else if (statistics.currentTimeMilliseconds > statistics.maxTimeMilliseconds) {
      text =
        `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is the new max value! ` +
        `Avg: ${statistics.averageTimeMilliseconds.toFixed(2)} ms, ` +
        `Min: ${statistics.minTimeMilliseconds.toFixed(2)} ms, ` +
        `Max: ${statistics.maxTimeMilliseconds.toFixed(2)} ms.`;
    } else if (statistics.currentTimeMilliseconds < statistics.averageTimeMilliseconds - 0.05) {
      text =
        `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is below average. ` +
        `Avg: ${statistics.averageTimeMilliseconds.toFixed(2)} ms, ` +
        `Min: ${statistics.minTimeMilliseconds.toFixed(2)} ms, ` +
        `Max: ${statistics.maxTimeMilliseconds.toFixed(2)} ms.`;
    } else if (statistics.currentTimeMilliseconds > statistics.averageTimeMilliseconds + 0.05) {
      text =
        `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is above average. ` +
        `Avg: ${statistics.averageTimeMilliseconds.toFixed(2)} ms, ` +
        `Min: ${statistics.minTimeMilliseconds.toFixed(2)} ms, ` +
        `Max: ${statistics.maxTimeMilliseconds.toFixed(2)} ms.`;
    } else {
      text =
        `Current time (${statistics.currentTimeMilliseconds.toFixed(2)} ms) is the average value. ` +
        `Avg: ${statistics.averageTimeMilliseconds.toFixed(2)} ms, ` +
        `Min: ${statistics.minTimeMilliseconds.toFixed(2)} ms, ` +
        `Max: ${statistics.maxTimeMilliseconds.toFixed(2)} ms.`;
    }

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
          <Form.Item name="size" label="Size">
            <InputNumber />
          </Form.Item>
          <Form.Item name="mode" label="Mode">
            <Select placeholder="Select a mode">
              <Select.Option value="type">Type</Select.Option>
              <Select.Option value="type-pronunciation">Type & Pronunciation</Select.Option>
              <Select.Option value="characters">Characters</Select.Option>
              <Select.Option value="characters-pronunciation">Characters & Pronunciation</Select.Option>
              <Select.Option value="full-description">Full Description</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
      <Table dataSource={hieroglyphWordRecords} rowKey="index" columns={columns} pagination={false} size="small" />
      <Card
        id="hieroglyphWordExerciseResultsCard"
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
          Hieroglyph words peeked: {hieroglyphWordsPeeked} of {hieroglyphWordsTotal} (
          {((100 * hieroglyphWordsPeeked) / hieroglyphWordsTotalDivisionSafe).toFixed(2)} %).
        </p>
        <p>
          Hieroglyph words completed: {hieroglyphWordsCompleted} of {hieroglyphWordsTotal} (
          {((100 * hieroglyphWordsCompleted) / hieroglyphWordsTotalDivisionSafe).toFixed(2)} %).
        </p>
        {statistics && statisticsParagraph}
      </Card>
    </>
  );
};

export default HieroglyphWordExercise;
