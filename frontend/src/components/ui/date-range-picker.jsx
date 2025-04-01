import React from 'react';
import { Input } from "@/components/ui/input";

const DateRangePicker = ({ value, onChange, className }) => {
  const handleStartChange = (e) => {
    onChange({
      start: e.target.value,
      end: value?.end || ''
    });
  };

  const handleEndChange = (e) => {
    onChange({
      start: value?.start || '',
      end: e.target.value
    });
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Input
        type="date"
        value={value?.start || ''}
        onChange={handleStartChange}
        className="w-full"
      />
      <span className="text-muted-foreground">to</span>
      <Input
        type="date"
        value={value?.end || ''}
        onChange={handleEndChange}
        className="w-full"
      />
    </div>
  );
};

export default DateRangePicker; 