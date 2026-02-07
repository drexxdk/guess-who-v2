'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';

interface GameQRCodeProps {
  gameCode: string;
}

export function GameQRCode({ gameCode }: GameQRCodeProps) {
  // Get the full URL for the join page with the code pre-filled
  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/game/join?code=${gameCode}`
    : `/game/join?code=${gameCode}`;

  return (
    <Card className="inline-block">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-3">
          <QRCodeSVG
            value={joinUrl}
            size={200}
            level="M"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
          <p className="text-muted-foreground text-xs text-center">
            Scan to join with code pre-filled
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
