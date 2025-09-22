import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, AlertCircle } from '@/lib/icons';
import { buildManifest, manifestHashHex, DaraManifest } from '@/lib/manifest';
import { uploadToZeroG } from '@/services/ogStorageClient';
import { getSigner, getDaraContract } from '@/lib/ethersClient';

interface EditDatasetProps {
  datasetRoot: string;
  manifestRoot: string;
  currentTitle?: string;
  currentDescription?: string;
  onEditComplete?: (newManifestRoot: string, newTx: string) => void;
  onCancel?: () => void;
}

export const EditDataset: React.FC<EditDatasetProps> = ({
  datasetRoot,
  manifestRoot,
  currentTitle = "Research Dataset",
  currentDescription = "",
  onEditComplete,
  onCancel
}) => {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Get the user's address
      const signer = await getSigner();
      const uploader = await signer.getAddress();

      // Build updated manifest
      const updatedManifest: DaraManifest = buildManifest({
        rootHash: datasetRoot,
        title: title.trim(),
        uploader,
        app: "DARA",
        version: "0.1",
        description: description.trim()
      });

      // Upload updated manifest
      const manifestBlob = new Blob([JSON.stringify(updatedManifest, null, 2)], { 
        type: "application/json"
      });
      const manifestFile = new File([manifestBlob], "manifest.json");
      const manifestUpload = await uploadToZeroG(manifestFile);

      if (manifestUpload.root && onEditComplete) {
        onEditComplete(manifestUpload.root, manifestUpload.tx || "");
      }

      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    setDescription(currentDescription);
    setIsEditing(false);
    setError("");
    if (onCancel) {
      onCancel();
    }
  };

  if (!isEditing) {
    return (
      <Card className="border-slate-600 bg-slate-800/50">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="text-slate-300 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="border-slate-500 hover:bg-slate-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-400">
            <div>Dataset Root: <code className="text-blue-400">{datasetRoot}</code></div>
            <div>Manifest Root: <code className="text-purple-400">{manifestRoot}</code></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-500/30 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit Dataset Metadata
        </CardTitle>
        <CardDescription className="text-slate-300">
          Update the dataset title and description. This will create a new manifest.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter dataset title"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter dataset description (optional)"
            className="bg-slate-700 border-slate-600 text-white"
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="border-slate-500 hover:bg-slate-700"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};