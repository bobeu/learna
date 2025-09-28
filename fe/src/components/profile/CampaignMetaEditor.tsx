"use client";
/* eslint-disable */
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Metadata } from "../../../types";

export default function CampaignMetaEditor({ metadata: mt, onClose }: { metadata: Metadata; onClose: () => void }) {
  const [name, setName] = useState(mt.name || "");
  const [link, setLink] = useState(mt.link || "");
  const [imageUrl, setImageUrl] = useState(mt.imageUrl || "");
  const [description, setDescription] = useState(mt.description || "");

  const handleSave = async () => {
    // TODO: integrate on-chain write when ABI/methods are defined.
    // For now, just close.
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-surface">
        <DialogHeader>
          <DialogTitle>Edit Campaign Metadata</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="link">Link</Label>
            <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600" onClick={onClose}>Cancel</Button>
            <Button className="bg-primary-500 text-black hover:bg-primary-400" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


