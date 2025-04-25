import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash } from "lucide-react";

interface TagCardProps {
  tag: string;
}

const TagCard: React.FC<TagCardProps> = ({ tag }) => {
  return (
    <Link href={`/tag/${tag}`}>
      <Card className="hover:bg-accent transition-colors h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl">
            <Hash className="h-5 w-5 mr-2" />
            {tag}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View content tagged with #{tag}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TagCard;