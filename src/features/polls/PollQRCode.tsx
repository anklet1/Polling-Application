import QRCode from "react-qr-code";
import { Card } from "@/components/ui/card";

export default function PollQRCode({ pollUrl }: { pollUrl: string }) {
  return (
    <Card className="flex flex-col items-center p-6">
      <h3 className="text-lg font-semibold mb-4">Share this poll</h3>
      <div className="bg-white p-4 rounded shadow">
        <QRCode value={pollUrl} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground break-all">{pollUrl}</p>
    </Card>
  );
}
