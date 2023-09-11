import { Space, Tabs, Typography } from "antd";
import HieroglyphExercise from "./HieroglyphExercise";
import HieroglyphWordExercise from "./HieroglyphWordExercise";

import styles from "./Application.module.css";

const Application = () => {
  const tabItems = [
    {
      key: "hieroglyphs",
      label: "Hieroglyphs",
      children: <HieroglyphExercise />,
    },
    {
      key: "hieroglyphWords",
      label: "Hieroglyph Words",
      children: <HieroglyphWordExercise />,
    },
  ];

  return (
    <Space className={styles.page} direction="vertical">
      <Typography.Title level={2}>Hieroglyphic Writing Exercise Tool</Typography.Title>
      <Tabs items={tabItems} />
    </Space>
  );
};

export default Application;
