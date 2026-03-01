import { Button } from "antd";
import { useState } from "react";

export default function MyButton({
  children,
  style,
  htmlType = "button",
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      htmlType={htmlType}
      style={{
        backgroundColor: isHovered
          ? "var(--secondary-color)"
          : "var(--primary-color)",
        border: "1px solid var(--primary-color)",
        color: isHovered ? "var(--primary-color)" : "var(--secondary-color)",
        transition: "background-color 0.2s ease",
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </Button>
  );
}
