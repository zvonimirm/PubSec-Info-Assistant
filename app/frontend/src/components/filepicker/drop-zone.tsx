// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { array, func } from "prop-types";
import React from "react";
import styles from "./drop-zone.module.css";
import { useTranslation } from "react-i18next";

const Banner = ({ onClick, onDrop }: {onClick: any, onDrop: any}) => {
  const { t } = useTranslation();
  const handleDragOver = (ev: any) => {
    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (ev: any) => {
    ev.preventDefault();
    ev.stopPropagation();
    onDrop(ev.dataTransfer.files);
  };

  return (
    <div
      className={styles.banner}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <span className={styles.banner_text}>{t("DropZone.banner1")}</span>
      <span className={styles.banner_text}>{t("DropZone.banner2")}</span>
      <span className={styles.banner_text}>{t("DropZone.banner3")}</span>
    </div>
  );
};

const DropZone = ({ onChange, accept = ["*"] }: {onChange: any, accept: string[]}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (ev: any) => {
    onChange(ev.target.files);
  };

  const handleDrop = (files: any) => {
    onChange(files);
  };

  return (
    <div className={styles.wrapper}>
      <Banner onClick={handleClick} onDrop={handleDrop} />
      <input
        type="file"
        aria-label="add files"
        className={styles.input}
        ref={inputRef}
        multiple={true}
        onChange={handleChange}
        accept={accept.join(",")}
      />
    </div>
  );
};

DropZone.propTypes = {
  accept: array,
  onChange: func,
};

export { DropZone };
