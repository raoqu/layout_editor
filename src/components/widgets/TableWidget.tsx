import React from 'react';
import { Table, Card } from 'antd';
import type { WidgetComponentProps } from '../../types';

const TableWidget: React.FC<WidgetComponentProps> = ({ widget, isSelected }) => {
  const { columns, dataSource, title } = widget.properties;

  return (
    <Card
      title={title || null}
      headStyle={{ display: title ? 'block' : 'none' }}
      style={{ 
        height: '100%', 
        width: '100%',
        border: isSelected ? '2px dashed #1890ff' : '1px solid #f0f0f0',
        overflow: 'hidden',
      }}
      bodyStyle={{ padding: '0', height: title ? 'calc(100% - 57px)' : '100%' }}
    >
      <Table 
        columns={columns} 
        dataSource={dataSource}
        size="small"
        pagination={false}
        scroll={{ y: '100%', x: true }}
        style={{ height: '100%' }}
      />
    </Card>
  );
};

export default TableWidget;
