import { useNostr } from 'nostr-react';
import { finalizeEvent, nip19, NostrEvent } from 'nostr-tools';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { ReloadIcon } from '@radix-ui/react-icons';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const UploadComponent: React.FC = () => {

  const { publish } = useNostr();
  const { createHash } = require('crypto');
  const loginType = typeof window !== 'undefined' ? window.localStorage.getItem('loginType') : null;
  const [previewUrl, setPreviewUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Optional: Bereinigung alter URLs
      return () => URL.revokeObjectURL(url);
    }
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const desc = formData.get('description') as string;
    const file = formData.get('file') as File;
    let sha256 = '';
    let finalNoteContent = desc;
    let finalFileUrl = '';
    console.log('File:', file);

    if (!desc && !file.size) {
      alert('Please enter a description and/or upload a file');
      setIsLoading(false);
      return;
    }

    // get every hashtag in desc and cut off the # symbol
    let hashtags: string[] = desc.match(/#[a-zA-Z0-9]+/g) || [];
    if (hashtags) {
      hashtags = hashtags.map((hashtag) => hashtag.slice(1));
    }


    // If file is is preent, upload it to the media server
    if (file) {
      const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });
      };

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const hashBuffer = createHash('sha256').update(Buffer.from(arrayBuffer)).digest();
        sha256 = hashBuffer.toString('hex');

        const unixNow = () => Math.floor(Date.now() / 1000);
        const newExpirationValue = () => (unixNow() + 60 * 5).toString();

        const pubkey = window.localStorage.getItem('pubkey');
        const createdAt = Math.floor(Date.now() / 1000);

        // Create auth event for blossom auth via nostr
        let authEvent = {
          kind: 24242,
          content: desc,
          created_at: createdAt,
          tags: [
            ['t', 'upload'],
            ['x', sha256],
            ['expiration', newExpirationValue()],
          ],
        };

        console.log(authEvent);

        // Sign auth event
        let authEventSigned = {};
        if (loginType === 'extension') {
          authEventSigned = await window.nostr.signEvent(authEvent);
        } else if (loginType === 'amber') {
          // TODO: Sign event with amber
          alert('Signing with Amber is not implemented yet, sorry!');
        } else if (loginType === 'raw_nsec') {
          if (typeof window !== 'undefined') {
            let nsecStr = null;
            nsecStr = window.localStorage.getItem('nsec');
            if (nsecStr != null) {
              authEventSigned = finalizeEvent(authEvent, hexToBytes(nsecStr));
            }
          }
        }
        console.log(authEventSigned);

        // Actually upload the file
        await fetch('https://media.lumina.rocks/upload', {
          method: 'PUT',
          body: file,
          headers: { authorization: 'Nostr ' + btoa(JSON.stringify(authEventSigned)) },
        }).then(async (res) => {
          if (res.ok) {
            let responseText = await res.text();
            let responseJson = JSON.parse(responseText);
            finalFileUrl = responseJson.url;
          } else {
            alert(await res.text());
          }
        });
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }

    let noteTags = hashtags.map((tag) => ['t', tag]);

    // If we have a file, add the file url to the note content
    // and also to the note tags imeta
    //   "tags": [
    //   [
    //     "imeta",
    //     "url https://nostr.build/i/my-image.jpg",
    //     "m image/jpeg",
    //     "blurhash eVF$^OI:${M{o#*0-nNFxakD-?xVM}WEWB%iNKxvR-oetmo#R-aen$",
    //     "dim 3024x4032",
    //     "alt A scenic photo overlooking the coast of Costa Rica",
    //     "x <sha256 hash as specified in NIP 94>",
    //     "fallback https://nostrcheck.me/alt1.jpg",
    //     "fallback https://void.cat/alt1.jpg"
    //   ]
    // ]
    if (finalFileUrl) {
      // convert file into image
      const image = new Image();
      image.src = URL.createObjectURL(file);

      finalNoteContent = finalFileUrl + ' ' + desc;
      noteTags.push(['imeta', 'url ' + finalFileUrl, 'm ' + file.type, 'x ' + sha256, 'ox ' + sha256]);
    }

    const createdAt = Math.floor(Date.now() / 1000);


    // Create the actual note
    let noteEvent = {
      kind: 1,
      content: finalNoteContent,
      created_at: createdAt,
      tags: noteTags,
    };

    let signedEvent: NostrEvent | null = null;

    // Sign the actual note
    if (loginType === 'extension') {
      signedEvent = await window.nostr.signEvent(noteEvent);
    } else if (loginType === 'amber') {
      // TODO: Sign event with amber
      alert('Signing with Amber is not implemented yet, sorry!');
    } else if (loginType === 'raw_nsec') {
      if (typeof window !== 'undefined') {
        let nsecStr = null;
        nsecStr = window.localStorage.getItem('nsec');
        if (nsecStr != null) {
          signedEvent = finalizeEvent(noteEvent, hexToBytes(nsecStr));
        }
      }
    }

    // If the got a signed event, publish it to nostr
    if (signedEvent) {
      console.log("final Event: ")
      console.log(signedEvent)
      publish(signedEvent);
    }

    // Redirect to the note
    setIsLoading(false);
    if (signedEvent != null) {
      window.location.href = '/note/' + nip19.noteEncode(signedEvent.id);
    }
  }

  return (
    <>
      <div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Textarea name="description" rows={6} placeholder="Your description" id="description" className="w-full"></Textarea>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Image Upload</AccordionTrigger>
              <AccordionContent>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input id="file" name='file' type="file" accept='image/*' onChange={handleFileChange} />
                </div>
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full pt-4" />}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {isLoading ? (
            <Button className='w-full' disabled>Uploading.. <ReloadIcon className="m-2 h-4 w-4 animate-spin" /></Button>
          ) : (
            <Button className='w-full'>Upload</Button>
          )}
        </form>
      </div>
    </>
  );
}

export default UploadComponent;