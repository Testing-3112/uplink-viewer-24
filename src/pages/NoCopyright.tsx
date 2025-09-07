
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NoCopyright = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 space-y-6">
          <h1 className="text-3xl font-bold">No Copyright Policy</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-4">
            <h2 className="text-2xl font-semibold">Copyright Disclaimer</h2>
            <p>
              This website hosts and shares videos that are believed to be in the public domain or used under fair use principles. 
              We do not claim ownership of any copyrighted material displayed on this platform.
            </p>

            <h3 className="text-xl font-semibold">Fair Use Policy</h3>
            <p>
              All content on this platform is shared under the Fair Use doctrine for purposes such as:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Educational purposes</li>
              <li>Commentary and criticism</li>
              <li>News reporting</li>
              <li>Research and scholarship</li>
            </ul>

            <h3 className="text-xl font-semibold">Copyright Notice</h3>
            <p>
              If you are a copyright holder and believe that your work has been used inappropriately, 
              please contact us immediately with:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Detailed description of the copyrighted work</li>
              <li>URL of the content in question</li>
              <li>Your contact information</li>
              <li>Proof of copyright ownership</li>
            </ul>

            <h3 className="text-xl font-semibold">Content Removal</h3>
            <p>
              We respect intellectual property rights and will promptly remove any content upon 
              receiving a valid copyright infringement notice. Content will be reviewed within 
              24-48 hours of notification.
            </p>

            <h3 className="text-xl font-semibold">User Responsibility</h3>
            <p>
              Users are responsible for ensuring their use of any downloaded or viewed content 
              complies with applicable copyright laws in their jurisdiction.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NoCopyright;
