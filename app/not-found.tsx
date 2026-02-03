import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="p-2 flex justify-center items-center min-h-screen">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Page not found</CardTitle>
        </CardHeader>
        <CardContent>
          The requested page could not be found.{" "}
          <Link href="/">Go back home</Link>
        </CardContent>
      </Card>
    </div>
  );
};
export default NotFound;
