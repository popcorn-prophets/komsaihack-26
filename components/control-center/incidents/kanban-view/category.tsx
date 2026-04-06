import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface CategoryCardProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

function formatTitle(title: string) {
  const formattedTitle: string[] = title.split('_');
  return formattedTitle.length === 1
    ? formattedTitle[0]
    : formattedTitle[0] + ' ' + formattedTitle[1];
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>{formatTitle(title)}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default CategoryCard;
