import * as React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export function Card({ children, className, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={
        "rounded-2xl border border-phorium-off/30 bg-phorium-dark/90 shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-sm " +
        (className ?? "")
      }
    >
      {children}
    </Tag>
  );
}
