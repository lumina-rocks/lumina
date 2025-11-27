import { useState, useRef } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { LoginArea } from '@/components/auth/LoginArea';
import { ImageIcon, X, Loader2, ChevronDown } from 'lucide-react';

export function Upload() {
  useSeoMeta({
    title: 'Upload Picture - LUMINA',
    description: 'Share your amazing pictures on Nostr.',
  });

  const { user } = useCurrentUser();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutateAsync: publishEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/apng'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported image format.`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to upload pictures.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: 'No images selected',
        description: 'Please select at least one image to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your post.',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: 'Uploading images...',
        description: `Uploading ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}...`,
      });

      // Upload all files and get their tags
      const uploadResults = await Promise.all(
        selectedFiles.map(file => uploadFile(file))
      );

      // Build tags for the event
      const tags: string[][] = [
        ['title', title.trim()],
      ];

      // Add imeta tags for each uploaded image
      uploadResults.forEach(fileTags => {
        // The upload returns NIP-94 compatible tags
        // We need to convert them to imeta format for kind 20
        const imetaTag: string[] = ['imeta'];
        
        for (const tag of fileTags) {
          const [tagName, ...values] = tag;
          
          if (tagName === 'url') {
            imetaTag.push(`url ${values[0]}`);
          } else if (tagName === 'x') {
            imetaTag.push(`x ${values[0]}`);
          } else if (tagName === 'm') {
            imetaTag.push(`m ${values[0]}`);
          } else if (tagName === 'size') {
            // Size is not typically used in imeta, skip it
            continue;
          } else if (tagName === 'dim') {
            imetaTag.push(`dim ${values[0]}`);
          } else if (tagName === 'blurhash') {
            imetaTag.push(`blurhash ${values[0]}`);
          } else if (tagName === 'alt') {
            imetaTag.push(`alt ${values[0]}`);
          }
        }
        
        tags.push(imetaTag);
      });

      // Add hashtags if provided
      if (hashtags.trim()) {
        const tagList = hashtags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        tagList.forEach(tag => {
          tags.push(['t', tag]);
        });
      }

      // Add location if provided
      if (location.trim()) {
        tags.push(['location', location.trim()]);
      }

      // Add alt tag for NIP-31
      tags.push(['alt', `A picture post titled "${title.trim()}"`]);

      // Publish the event
      await publishEvent({
        kind: 20,
        content: content.trim(),
        tags,
      });

      toast({
        title: 'Success!',
        description: 'Your picture has been published.',
      });

      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload and publish your picture.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isUploading || isPublishing;

  if (!user) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Upload Picture</CardTitle>
                <CardDescription>Please log in to upload pictures</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LoginArea className="max-w-60" />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Upload Picture</CardTitle>
              <CardDescription>Share your amazing pictures on Nostr</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Area */}
                <div className="space-y-2">
                  <Label htmlFor="images">Images *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="images"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/apng"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isLoading}
                    />
                    {selectedFiles.length === 0 ? (
                      <div className="space-y-4">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP, GIF, AVIF, or APNG
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                        >
                          Select Images
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                        >
                          Add More Images
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your post"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Description/Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Description</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your picture(s)..."
                    className="min-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <Label htmlFor="hashtags">Hashtags</Label>
                  <Input
                    id="hashtags"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="sunset, travel, photography (comma-separated)"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple tags with commas
                  </p>
                </div>

                {/* Advanced Options */}
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-between"
                      disabled={isLoading}
                    >
                      <span>Advanced Options</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="San José, Costa Rica"
                        disabled={isLoading}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || selectedFiles.length === 0 || !title.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Publishing...'}
                      </>
                    ) : (
                      'Publish Picture'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
