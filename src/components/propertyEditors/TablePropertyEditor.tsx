import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { WidgetPropertyEditorProps } from '../../types';

const TablePropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ widget, onPropertyChange }) => {
  const { columns, dataSource } = widget.properties;

  const handleColumnChange = (index: number, field: string, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    onPropertyChange('columns', newColumns);
  };

  const addColumn = () => {
    const newColumnKey = `col${columns.length + 1}`;
    const newColumns = [...columns, { 
      title: `Column ${columns.length + 1}`, 
      dataIndex: newColumnKey, 
      key: newColumnKey 
    }];
    
    // Update dataSource to include the new column
    const newDataSource = dataSource.map((row: any) => ({
      ...row,
      [newColumnKey]: `Value ${columns.length + 1}`
    }));
    
    onPropertyChange('columns', newColumns);
    onPropertyChange('dataSource', newDataSource);
  };

  const removeColumn = (index: number) => {
    const columnToRemove = columns[index];
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    
    // Remove the column data from dataSource
    const newDataSource = dataSource.map((row: any) => {
      const newRow = { ...row };
      delete newRow[columnToRemove.dataIndex];
      return newRow;
    });
    
    onPropertyChange('columns', newColumns);
    onPropertyChange('dataSource', newDataSource);
  };

  const handleDataRowChange = (rowIndex: number, columnKey: string, value: any) => {
    const newDataSource = [...dataSource];
    newDataSource[rowIndex] = { ...newDataSource[rowIndex], [columnKey]: value };
    onPropertyChange('dataSource', newDataSource);
  };

  const addDataRow = () => {
    const newRow: any = { key: `${dataSource.length + 1}` };
    columns.forEach((col: any) => {
      newRow[col.dataIndex] = `New ${col.title}`;
    });
    const newDataSource = [...dataSource, newRow];
    onPropertyChange('dataSource', newDataSource);
  };

  const removeDataRow = (index: number) => {
    const newDataSource = [...dataSource];
    newDataSource.splice(index, 1);
    onPropertyChange('dataSource', newDataSource);
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Columns">
        {columns.map((column: any, index: number) => (
          <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Form.Item label="Title" style={{ marginBottom: 0 }}>
              <Input
                value={column.title}
                onChange={(e) => handleColumnChange(index, 'title', e.target.value)}
                style={{ width: '120px' }}
              />
            </Form.Item>
            <Form.Item label="Key" style={{ marginBottom: 0 }}>
              <Input
                value={column.dataIndex}
                onChange={(e) => handleColumnChange(index, 'dataIndex', e.target.value)}
                style={{ width: '120px' }}
              />
            </Form.Item>
            <MinusCircleOutlined onClick={() => removeColumn(index)} />
          </Space>
        ))}
        <Button type="dashed" onClick={addColumn} block icon={<PlusOutlined />}>
          Add Column
        </Button>
      </Form.Item>

      <Form.Item label="Data Rows">
        {dataSource.map((row: any, rowIndex: number) => (
          <div key={rowIndex} style={{ marginBottom: '16px', padding: '8px', border: '1px dashed #d9d9d9' }}>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Row {rowIndex + 1}</span>
              <MinusCircleOutlined onClick={() => removeDataRow(rowIndex)} />
            </Space>
            {columns.map((column: any) => (
              <Form.Item key={column.dataIndex} label={column.title} style={{ marginBottom: 8 }}>
                <Input
                  value={row[column.dataIndex]}
                  onChange={(e) => handleDataRowChange(rowIndex, column.dataIndex, e.target.value)}
                />
              </Form.Item>
            ))}
          </div>
        ))}
        <Button type="dashed" onClick={addDataRow} block icon={<PlusOutlined />}>
          Add Data Row
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TablePropertyEditor;
