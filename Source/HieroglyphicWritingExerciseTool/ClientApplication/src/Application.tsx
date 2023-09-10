import { Button, Card, Checkbox, Form, InputNumber, Select, Space, Table, Typography } from "antd";
import styles from "./Application.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HieroglyphProperties } from "./entities/HieroglyphProperties";
import { HieroglyphModel } from "./models/HieroglyphModel";
import { generateExercise } from "./api/requests";

type ExerciseMode = "type" | "type-pronunciation" | "full-description" | "character";

const defaultExerciseMode: ExerciseMode = "character";

interface ExerciseConfiguration {
  useKanji: boolean;
  useKanjiOnly: boolean;
  size: number;
  mode: ExerciseMode;
}

const initialExerciseConfiguration: ExerciseConfiguration = {
  useKanji: false,
  useKanjiOnly: false,
  size: 36,
  mode: defaultExerciseMode,
};

interface HieroglyphRecord extends HieroglyphModel {
  index: number;
  displayed: boolean;
}

const Application = () => {
  const [mode, setMode] = useState<ExerciseMode>(defaultExerciseMode);
  const [hieroglyphs, setHieroglyphs] = useState<HieroglyphModel[]>([]);
  const [peekedIndexes, setPeekedIndexes] = useState<Set<number>>(new Set<number>());
  const [displayedIndexes, setDisplayedIndexes] = useState<Set<number>>(new Set<number>());
  const [completedIndexes, setCompletedIndexes] = useState<Set<number>>(new Set<number>());

  const [exerciseConfigurationForm] = Form.useForm<ExerciseConfiguration>();

  const hieroglyphsTotal = useMemo(() => hieroglyphs.length, [hieroglyphs]);

  const hieroglyphsTotalDivisionSafe = useMemo(() => (hieroglyphsTotal > 0 ? hieroglyphsTotal : 1), [hieroglyphsTotal]);

  const hieroglyphsPeeked = useMemo(() => peekedIndexes.size, [peekedIndexes]);

  const hieroglyphsCompleted = useMemo(() => completedIndexes.size, [completedIndexes]);

  const hiddenProperties = useMemo(() => {
    if (mode === "type") {
      return HieroglyphProperties.Type;
    } else if (mode === "type-pronunciation") {
      return HieroglyphProperties.Type | HieroglyphProperties.Pronunciation;
    } else if (mode === "full-description") {
      return HieroglyphProperties.Type | HieroglyphProperties.Pronunciation | HieroglyphProperties.Syllable | HieroglyphProperties.Meaning;
    } else {
      return HieroglyphProperties.Character;
    }
  }, [mode]);

  const hieroglyphRecords = useMemo(() => {
    return hieroglyphs.map((hieroglyph, index) => {
      const record = {
        index: index,
        displayed: peekedIndexes.has(index) || displayedIndexes.has(index),
        ...hieroglyph,
      };

      if (hiddenProperties & HieroglyphProperties.Type && !record.displayed) {
        record.type = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Character && !record.displayed) {
        record.character = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Pronunciation && !record.displayed) {
        record.pronunciation = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Syllable && !record.displayed) {
        record.syllable = "???";
      }
      if (hiddenProperties & HieroglyphProperties.Meaning && !record.displayed) {
        record.meaning = "???";
      }

      return record;
    });
  }, [hieroglyphs, peekedIndexes, displayedIndexes, hiddenProperties]);

  const onGenerateButtonClick = useCallback(() => {
    exerciseConfigurationForm.submit();
  }, [exerciseConfigurationForm]);

  const onResetButtonClick = useCallback(() => {
    setHieroglyphs([]);
    setPeekedIndexes(new Set<number>());
    setDisplayedIndexes(new Set<number>());
    setCompletedIndexes(new Set<number>());
    exerciseConfigurationForm.resetFields();
  }, [exerciseConfigurationForm]);

  const onPeekButtonClick = useCallback(
    (index: number) => {
      setPeekedIndexes(new Set<number>([...Array.from(peekedIndexes.values()), index]));
    },
    [peekedIndexes]
  );

  const onDisplayButtonClick = useCallback(
    (index: number) => {
      setDisplayedIndexes(new Set<number>([...Array.from(displayedIndexes.values()), index]));
    },
    [displayedIndexes]
  );

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

  useEffect(() => {
    if (hieroglyphsTotal === hieroglyphsCompleted && hieroglyphsTotal !== 0) {
      window.location.href = "#exerciseResultsCard";
    }
  }, [hieroglyphsTotal, hieroglyphsCompleted]);

  const onBackToTopButtonClick = useCallback(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const onFormFinish = (exerciseConfiguration: ExerciseConfiguration) => {
    const { useKanji, useKanjiOnly, size, mode } = exerciseConfiguration;
    generateExercise({
      useKanji: useKanji || useKanjiOnly,
      useKanjiOnly: useKanjiOnly,
      size: size,
    }).then((response) => {
      setMode(mode);
      setHieroglyphs(response.hieroglyphs);
      setPeekedIndexes(new Set<number>());
      setDisplayedIndexes(new Set<number>());
      setCompletedIndexes(new Set<number>());
    });
  };

  const onFormFinishFailed = () => {
    alert("Form validation failed.");
  };

  const columns = [
    {
      key: "index",
      title: "#",
      dataIndex: "index",
      render: (index: number) => 1 + index,
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
    },
    {
      key: "character",
      title: "Character",
      dataIndex: "character",
    },
    {
      key: "pronunciation",
      title: "Pronunciation",
      dataIndex: "pronunciation",
    },
    {
      key: "syllable",
      title: "Syllable (?)",
      dataIndex: "syllable",
      render: (syllable?: string) => syllable ?? <Typography.Text type="secondary">N/A</Typography.Text>,
    },
    {
      key: "meaning",
      title: "Meaning (?)",
      dataIndex: "meaning",
      render: (meaning?: string) => meaning ?? <Typography.Text type="secondary">N/A</Typography.Text>,
    },
    {
      key: "action",
      title: "Action",
      render: (_: any, record: HieroglyphRecord) => (
        <Space wrap direction="horizontal" align="baseline">
          <Button disabled={record.displayed} onClick={() => onPeekButtonClick(record.index)} danger>
            Peek
          </Button>
          <Button disabled={record.displayed} onClick={() => onDisplayButtonClick(record.index)}>
            Display
          </Button>
          <Checkbox onChange={(e) => onCompleteCheckboxChanged(record.index, e.target.checked)}>Complete</Checkbox>
        </Space>
      ),
    },
  ];

  return (
    <Space className={styles.page} direction="vertical">
      <Typography.Title level={2}>Hieroglyphic Writing Exercise Tool</Typography.Title>
      <Card
        title={
          <Space wrap className={styles.cardHeader} direction="horizontal" align="baseline">
            <Space wrap direction="horizontal" align="baseline">
              Exercise Configuration
            </Space>
            <Space wrap direction="horizontal" align="baseline">
              <Button type="primary" onClick={onGenerateButtonClick}>
                Generate
              </Button>
              <Button type="primary" onClick={onResetButtonClick} danger>
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
              <Select.Option value="full-description">Full Description</Select.Option>
              <Select.Option value="character">Character</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
      <Table dataSource={hieroglyphRecords} rowKey="index" columns={columns} pagination={false} />
      <Card
        id="exerciseResultsCard"
        title={
          <Space wrap className={styles.cardHeader} direction="horizontal" align="baseline">
            <Space wrap direction="horizontal" align="baseline">
              Exercise Results
            </Space>
            <Space wrap direction="horizontal" align="baseline">
              <Button type="primary" onClick={onBackToTopButtonClick}>
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
      </Card>
    </Space>
  );
};

export default Application;
