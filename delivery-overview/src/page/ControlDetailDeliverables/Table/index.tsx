import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Tag, Typography, Skeleton, Popover, Avatar, Upload } from "@douyinfe/semi-ui";
import { IconFile, IconChevronDown, IconDownload } from "@douyinfe/semi-icons";
import moment from "moment";
import "./index.less";
import { getFieldMsg, NoSupportType } from "./constants";
import { Icon } from "@douyinfe/semi-ui";
import { getFieldValue } from "../utils";
import _groupBy from "lodash/groupBy";
import sdk from "../../../utils/sdk";
import { getSpace } from "../../../utils/index";
import { fetchUserInfo } from "../../../api/services";
import FileModal from "./FileModal";
// 执行即生效
window.JSSDK.utils.overwriteThemeForSemiUI();

const tagGroupStyle = {
  display: "flex",
  alignItems: "center",
  width: "100%",
};

const Table = (props) => {
  const {
    columns = [],
    data,
    allFieldsObj2,
    // spaceId,
    ownersList = [],
    ...rest
  } = props;
  const [controlCtx, setControlCtx] = useState<any>({});
  const [fieldMap, setFieldMap] = useState({});
  const [spaceSimpleName, setSpaceSimpleName] = useState("");
  const [ownersObj, setOwnersObj] = useState<Record<string, any>>({});
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sdk?.control?.getContext().then((_controlCtx) => {
      setControlCtx(_controlCtx);
    });
    // sdk取字段列表
  }, []);

  const renderShowType = (showType, item, fieldMap) => {
    const realVal = fieldMap?.[item.field_key_unikey]?.value;
    if (item.fieldValue && item.type === "instance_deliverable") {
      if (item.fieldValue) {
        const owners =
          item.fieldValue.indexOf(",") > -1
            ? item.fieldValue.split(",")
            : [item.fieldValue];
        return (
          <div className="col-instance">
            <div className="user-tag" style={tagGroupStyle}>
              {owners.slice(0, 1).map((i) => (
                <Tag key={i} color="white" size="small">
                  <Avatar src={ownersObj[i]?.avatar_url} shape="circle" size="small" style={{ marginRight: 4 }} />
                  {ownersObj[i]?.name_cn}
                </Tag>
              ))}
              {owners.length > 1 && (
                <Popover
                  content={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {owners.slice(1).map((i) => (
                        <Tag key={i} color="white" size="small">
                          <Avatar src={ownersObj[i]?.avatar_url} shape="circle" size="small" style={{ marginRight: 4 }} />
                          {ownersObj[i]?.name_cn}
                        </Tag>
                      ))}
                    </div>
                  }
                >
                  <Tag size="small">+{owners.length - 1}</Tag>
                </Popover>
              )}
            </div>
          </div>
        );
      }
    }

    try {
      if (realVal && item.type !== "instance_deliverable") {
        const type = getFieldMsg[item["type"]]?.showType?.();
        
        const key = fieldMap?.[item.field_key_unikey]?.key;
        if (type === "text") {
          const row =
            typeof getFieldMsg[item["type"]]?.row === "function"
              ? getFieldMsg[item["type"]]?.row()
              : 1;
          return (
            <div
              className={`${
                item.type !== "instance_deliverable" ? "col-detail" : ""
              }`}
            >
              <Typography.Text
                ellipsis={{
                  rows: row,
                  showTooltip: {
                    opts: { content: fieldMap?.[item.field_key_unikey]?.value },
                  },
                }}
                style={{ fontSize: 14 }}
              >
                {key === "name"
                  ? `【${fieldMap?.[item.field_key_unikey]?.value}】`
                  : fieldMap?.[item.field_key_unikey]?.value}
              </Typography.Text>
            </div>
          );
        } else if (type === "tag") {
          const val: string[] = [];
          const originVal = fieldMap?.[item.field_key_unikey]?.value;
          if (typeof originVal === "string") {
            if (originVal.indexOf(",") > -1) {
              val.push(...originVal.split(","));
            } else {
              val.push(originVal);
            }
          }
          if (Array.isArray(val) && val.length > 0) {
            return (
              <div
                className={`${
                  item.type !== "instance_deliverable" ? "col-detail" : ""
                }`}
              >
                <div className="select-tag" style={tagGroupStyle}>
                  {val.slice(0, 1).map((i) => (
                    <Tag key={i} color="white" size="small">{i}</Tag>
                  ))}
                  {val.length > 1 && (
                    <Popover
                      content={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {val.slice(1).map((i) => (
                            <Tag key={i} color="white" size="small">{i}</Tag>
                          ))}
                        </div>
                      }
                    >
                      <Tag size="small">+{val.length - 1}</Tag>
                    </Popover>
                  )}
                </div>
              </div>
            );
          }
        } else if (type === "user") {
          const user_text_list =
            fieldMap?.[item.field_key_unikey]?.user_text_list ?? [];
          if (Array.isArray(user_text_list) && user_text_list.length) {
            return (
              <div
                className={`${
                  item.type !== "instance_deliverable" ? "col-detail" : ""
                }`}
              >
                <div className="user-tag" style={tagGroupStyle}>
                  {user_text_list.slice(0, 1).map((i, idx) => (
                    <Tag key={idx} color="white" size="small">
                      <Avatar src={i?.avatar} shape="circle" size="small" style={{ marginRight: 4,height: 17,width: 17 }} />
                      {i?.nickname}
                    </Tag>
                  ))}
                  {user_text_list.length > 1 && (
                    <Popover
                      content={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {user_text_list.slice(1).map((i, idx) => (
                            <Tag key={idx} color="white" size="small">
                              <Avatar src={i?.avatar} shape="circle" size="small" style={{ marginRight: 4 }} />
                              {i?.nickname}
                            </Tag>
                          ))}
                        </div>
                      }
                    >
                      <Tag size="small">+{user_text_list.length - 1}</Tag>
                    </Popover>
                  )}
                </div>
              </div>
            );
          }
          return fieldMap?.[item.field_key_unikey]?.value;
        } else if (type === "file") {
          const fileList = realVal.map((i) => ({
            ...i,
            status: "success",
            preview: true,
          }));
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                overflow: "hidden",
                width: "100%",
              }}
              // className="col-detail"
            >
              <Upload
                style={{ flex: 1 }}
                defaultFileList={fileList.slice(0, 1) as any}
                action=""
                renderFileOperation={(fileItem) => (
                  <Typography.Text style={{width: '14%'}}
                    onClick={() => {
                      sdk.navigation.open((fileItem as any).url || "", "_blank");
                    }}
                  >
                    <IconDownload />
                  </Typography.Text>
                )}
              />
              {fileList.length > 1 && (
                <IconChevronDown
                  onClick={() => {
                    setVisible(true);
                  }}
                  style={{ cursor: "pointer", marginLeft: 5 }}
                />
              )}
              <FileModal
                fileList={fileList}
                visible={visible}
                handleOk={() => setVisible(false)}
              />
            </div>
          );
        } else if (type === "link") {
          return (
            <div className="col-detail">
              <Typography.Text
                ellipsis={{
                  showTooltip: {
                    opts: { content: fieldMap?.[item.field_key_unikey]?.value },
                  },
                }}
                onClick={() => {
                  sdk.navigation.open(
                    fieldMap?.[item.field_key_unikey]?.value,
                    "target"
                  );
                }}
              >
                {fieldMap?.[item.field_key_unikey]?.value}
              </Typography.Text>
            </div>
          );
        } else if (type === "date") {
          const _format =
            fieldMap?.[item.field_key_unikey]?.format ?? "YYYY-MM-DD HH:mm";
          if (typeof realVal === "number") {
            return (
              <div
                className={`${
                  item.type !== "instance_deliverable" ? "col-detail" : ""
                }`}
              >
                {moment(realVal).format(_format)}
              </div>
            );
          }
        } else if (typeof realVal === "string") {
          return (
            <div
              className={`${
                item.type !== "instance_deliverable" ? "col-detail" : ""
              }`}
            >
              <Typography.Text
                ellipsis={{
                  rows: 1,
                  showTooltip: {
                    opts: { content: fieldMap?.[item.field_key_unikey]?.value },
                  },
                }}
                style={{ fontSize: 14 }}
              >
                {fieldMap?.[item.field_key_unikey]?.value}
              </Typography.Text>
            </div>
          );
        } else if (typeof realVal === "boolean") {
          <div
            className={`${
              item.type !== "instance_deliverable" ? "col-detail" : ""
            }`}
          >
            {realVal ? "是" : "否"}
          </div>;
        } else {
          <div
            className={`${
              item.type !== "instance_deliverable" ? "col-detail" : ""
            }`}
          >
            -
          </div>;
        }
      }
    } catch (err) {
      console.error("获取value_fail", err);
    }
    if (item.type === "instance_deliverable") {
      return "";
    }

    return (
      <div
        className={`${
          item.type !== "instance_deliverable" ? "col-detail" : ""
        }`}
      >
        {NoSupportType.includes(item["type"]) ? "暂不支持展示" : "-"}
      </div>
    );
  };

  useEffect(() => {
    setLoading(true);
    getSpace(controlCtx?.spaceId).then((space) => {
      setSpaceSimpleName(space?.simpleName || "");
    });
  }, [controlCtx?.spaceId]);

  useEffect(() => {
    if (ownersList.length === 0) {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
    if (ownersList.length > 0) {
      fetchUserInfo(ownersList)
        .then((res) => {
          const { err_code, data } = res;
          if (err_code === 0 && data) {
            const appOptMap: Record<string, any> = {};
            if (Array.isArray(data)) {
              data.forEach((item) => {
                if (!appOptMap[item.user_key]) {
                  appOptMap[item.user_key] = item;
                }
              });
              setOwnersObj(appOptMap);
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [ownersList]);

  useEffect(() => {
    if (!controlCtx?.spaceId) {
      return;
    }
    if (allFieldsObj2 && Object.keys(allFieldsObj2).length) {
      const groupByLists = _groupBy(data, "workObjectId");
      let _fieldMap: Record<string, any> = {};
      const len = Object.values(groupByLists).length;
      let i = 0;
      try {
        Object.values(groupByLists).forEach(async (element, idx) => {
          const _fields: any[] = [];
          const requests = (element as any[]).map((field) => {
            return new Promise((resolve, reject) => {
              const curField = field?.fieldValue;
              const _field = allFieldsObj2?.[element?.[0].workObjectId]?.find(
                (i) => i.field_key === field.field_key
              );
              if (_field) {
                _fields.push({ ..._field, field_type_key: _field.type });
                if (curField?.value) {
                  resolve(curField?.value);
                } else {
                  if (Array.isArray(curField)) {
                    if (curField.length > 0 && curField?.[0].value) {
                      resolve(curField.map((i) => i.value));
                    } else {
                      resolve(curField);
                    }
                  } else {
                    resolve(curField);
                  }
                }
              } else {
                resolve({});
              }
            });
          });
          const res = await getFieldValue({
            requests,
            spaceId: controlCtx?.spaceId,
            fields: _fields,
            workObjectId: element?.[0].workObjectId,
            changedField: {},
          });
          res.forEach((item: any) => {
            _fieldMap[`${element?.[0].workObjectId}$${item.field_key}`] = item;
          });
          i++;
          if (i === len) {
            setFieldMap(_fieldMap);
            setLoading(false);
          }
        });
      } catch (err) {
        setLoading(false);
      }
    }
  }, [data, allFieldsObj2, controlCtx?.spaceId]);

  const renderTitle = (title, item, idx) => {
    if (idx === 0 && item.type === "instance_deliverable") {
      const { workObjectId, id } = item;
      return (
        <Typography.Text style={{cursor: 'pointer',fontSize: 14, fontWeight: 500,color: '#3250EB'}}
          ellipsis
          onClick={() => {
            sdk.navigation.open(
              `/${spaceSimpleName}/delivery/detail/${id}`,
              "target"
            );
          }}
        >
          {title || "-"}
        </Typography.Text>
      );
    }
    return (
      <Typography.Text
        ellipsis={{
          showTooltip: {
            opts: { content: title },
          },
        }}
        style={{ fontSize: 14, fontWeight: 500 }}
      >
        {title}
      </Typography.Text>
    );
  };

  return (
    <Skeleton
      placeholder={<Skeleton type="paragraph" rows={3} />}
      loading={loading}
    >
      <div className="table-container" {...rest}>
        <Row className="row-task row-th" key={"row-th"}>
          {columns.map((item, index) => {
            return (
              <Col className="col-task" span={item.col}>
                {item.title}
              </Col>
            );
          })}
        </Row>
        {data.map((item, index) => {
          const showType = getFieldMsg[item["type"]]?.showType?.();
          return (
            <Row className="row-task" key={"row-th"}>
              {columns.map((_item, idx) => {
                return (
                  <Col className="col-task" span={_item.col}>
                    {idx === 0 && (
                      <Icon
                        svg={getFieldMsg[item["type"]]?.getIcon()}
                        className="col-icon"
                      />
                    )}
                    {/* 状态 */}
                    {columns[idx].dataIndex === "status" && (
                      <Tag
                        color={
                          item["status"] === 1
                            ? "orange"
                            : item["status"] === 2
                            ? "green"
                            : "grey"
                        }
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--semi-color-text-0)",
                          padding: "2px 8px",
                          borderRadius: "var(--semi-border-radius-extra-small)",
                        }}
                      >
                        {item["status"] === 1
                          ? "未提交"
                          : item["status"] === 2
                          ? "已提交"
                          : item["status"]}
                      </Tag>
                    )}
                    {/* 交付物详情 */}
                    {columns[idx].dataIndex === "fieldValue" &&
                      renderShowType(showType, item, fieldMap)}
                    {!["status", "fieldValue"].includes(
                      columns[idx].dataIndex
                    ) && renderTitle(item[columns[idx].dataIndex], item, idx)}
                    {/* {columns[idx].dataIndex}   */}
                  </Col>
                );
              })}
            </Row>
          );
        })}
      </div>
    </Skeleton>
  );
};
export default Table;
