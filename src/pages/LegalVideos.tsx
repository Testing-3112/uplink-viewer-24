
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LegalVideos = () => {
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
          <h1 className="text-3xl font-bold">Legal Videos Policy</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-4">
            <h2 className="text-2xl font-semibold">Content Standards</h2>
            <p>
              All videos hosted on this platform must comply with applicable laws and regulations. 
              We maintain strict content guidelines to ensure legal compliance.
            </p>

            <h3 className="text-xl font-semibold">Acceptable Content</h3>
            <p>Videos on this platform must be:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Legally obtained and distributed</li>
              <li>Free from copyrighted material (unless properly licensed)</li>
              <li>Appropriate for general audiences</li>
              <li>Non-infringing on intellectual property rights</li>
              <li>Compliant with content rating guidelines</li>
            </ul>

            <h3 className="text-xl font-semibold">Prohibited Content</h3>
            <p>The following types of content are strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Pirated or illegally distributed material</li>
              <li>Content that violates copyright laws</li>
              <li>Inappropriate or adult content</li>
              <li>Violence or harmful content</li>
              <li>Spam or misleading content</li>
            </ul>

            <h3 className="text-xl font-semibold">Legal Compliance</h3>
            <p>
              We work diligently to ensure all content meets legal standards including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>DMCA compliance</li>
              <li>International copyright laws</li>
              <li>Content rating requirements</li>
              <li>Regional broadcasting regulations</li>
            </ul>

            <h3 className="text-xl font-semibold">Content Verification</h3>
            <p>
              All uploaded content undergoes verification to ensure legal compliance. 
              This includes checking for proper licensing, copyright clearance, and 
              adherence to content guidelines.
            </p>

            <h3 className="text-xl font-semibold">Reporting Issues</h3>
            <p>
              If you encounter content that may violate our legal standards, please 
              report it immediately. We take all reports seriously and investigate 
              promptly to maintain legal compliance.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LegalVideos;
