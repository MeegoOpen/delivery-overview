import React from 'react';
import { Modal, Upload, Typography } from '@douyinfe/semi-ui';
import { IconFile, IconDownload } from '@douyinfe/semi-icons';
import sdk from '../../../utils/sdk';

interface Props {
  visible: boolean;
  fileList: {
    uid: string;
    name: string;
    status: string;
    size: number;
    url: string;
    preview?: boolean;
  }[];
  handleOk: () => void;
}
const FileModal = ({ visible, handleOk, fileList }: Props) => (
  <Modal
    title={'附件明细'}
    visible={visible}
    onOk={handleOk}
    onCancel={handleOk}
    className="semi-modal-attachment-info"
  >
    <Upload
      action={""}
      defaultFileList={fileList as any}
      renderFileOperate={(fileItem) => (
        <Typography.Text
          onClick={() => {
            sdk.navigation.open((fileItem as any).url || '', '_blank')
          }}
        >
          <IconDownload />
        </Typography.Text>
      )}
    />
  </Modal>
);
export default FileModal;
