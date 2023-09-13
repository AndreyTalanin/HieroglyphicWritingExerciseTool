import { Button, Card, Checkbox, Form, InputNumber, Select, Space, Table } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { generateHieroglyphWordExercise } from "./api/requests";
import { HieroglyphWordProperties } from "./entities/HieroglyphWordProperties";
import { HieroglyphWordModel } from "./models/HieroglyphWordModel";

import styles from "./HieroglyphWordExercise.module.css";

type ExerciseMode = "type" | "type-pronunciation" | "full-description" | "characters";

const defaultExerciseMode: ExerciseMode = "characters";

interface ExerciseConfiguration {
  size: number;
  mode: ExerciseMode;
}

const initialExerciseConfiguration: ExerciseConfiguration = {
  size: 36,
  mode: defaultExerciseMode,
};

interface HieroglyphWordRecord extends HieroglyphWordModel {
  index: number;
  displayed: boolean;
  completed: boolean;
}

const HieroglyphWordExercise = () => {
  const [mode, setMode] = useState<ExerciseMode>(defaultExerciseMode);
  const [hieroglyphWords, setHieroglyphWords] = useState<HieroglyphWordModel[]>([]);
  const [peekedIndexes, setPeekedIndexes] = useState<Set<number>>(new Set<number>());
  const [displayedIndexes, setDisplayedIndexes] = useState<Set<number>>(new Set<number>());
  const [completedIndexes, setCompletedIndexes] = useState<Set<number>>(new Set<number>());

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
    } else if (mode === "full-description") {
      return HieroglyphWordProperties.Type | HieroglyphWordProperties.Pronunciation | HieroglyphWordProperties.Meaning;
    } else {
      return HieroglyphWordProperties.Characters;
    }
  }, [mode]);

  const hieroglyphWordRecords = useMemo(() => {
    return hieroglyphWords.map((hieroglyphWord, index) => {
      const record = {
        index: index,
        displayed: peekedIndexes.has(index) || displayedIndexes.has(index),
        completed: completedIndexes.has(index),
        ...hieroglyphWord,
      };

      if (hiddenProperties & HieroglyphWordProperties.Type && !record.displayed) {
        record.type = "???";
      }
      if (hiddenProperties & HieroglyphWordProperties.Characters && !record.displayed) {
        record.characters = "???";
      }
      if (hiddenProperties & HieroglyphWordProperties.Pronunciation && !record.displayed) {
        record.pronunciation = "???";
      }
      if (hiddenProperties & HieroglyphWordProperties.Meaning && !record.displayed) {
        record.meaning = "???";
      }

      return record;
    });
  }, [hieroglyphWords, peekedIndexes, displayedIndexes, completedIndexes, hiddenProperties]);

  const onGenerateButtonClick = useCallback(() => {
    exerciseConfigurationForm.submit();
  }, [exerciseConfigurationForm]);

  const onResetButtonClick = useCallback(() => {
    setHieroglyphWords([]);
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
      setCompletedIndexes(new Set<number>([...Array.from(completedIndexes.values()), index]));
    },
    [displayedIndexes, completedIndexes]
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
    if (hieroglyphWordsTotal === hieroglyphWordsCompleted && hieroglyphWordsTotal !== 0) {
      window.location.href = "#hieroglyphWordExerciseResultsCard";
    }
  }, [hieroglyphWordsTotal, hieroglyphWordsCompleted]);

  const onBackToTopButtonClick = useCallback(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const onFormFinish = (exerciseConfiguration: ExerciseConfiguration) => {
    const { size, mode } = exerciseConfiguration;
    generateHieroglyphWordExercise({ size: size }).then((response) => {
      setMode(mode);
      setHieroglyphWords(response.hieroglyphWords);
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
          <Button size="small" disabled={record.displayed} onClick={() => onPeekButtonClick(record.index)} danger>
            Peek
          </Button>
          <Button size="small" disabled={record.displayed} onClick={() => onDisplayButtonClick(record.index)}>
            Display
          </Button>
          <Checkbox checked={record.completed} onChange={(e) => onCompleteCheckboxChanged(record.index, e.target.checked)}>
            Complete
          </Checkbox>
        </Space>
      ),
    },
  ];

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
              <Select.Option value="full-description">Full Description</Select.Option>
              <Select.Option value="characters">Characters</Select.Option>
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
      </Card>
    </>
  );
};

export default HieroglyphWordExercise;
