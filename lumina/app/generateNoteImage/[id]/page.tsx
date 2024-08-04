'use client';

import { useEffect, useState } from "react";
import Head from "next/head";
import { useParams } from 'next/navigation';
import NotePageComponent from "@/components/NotePageComponent";
import { nip19 } from "nostr-tools";
import { NostrProvider, useNostrEvents } from "nostr-react";
import GenerateNoteImageComponent from "@/components/GenerateNoteImageComponent";

export default function GenerateNoteImagePage() {

  const params = useParams()
  
  let id = params.id;

  if (id.includes("note1")) {
    id = nip19.decode(id.toString()).data.toString()
  }

  const relayUrls = ["wss://relay.lumina.rocks"];

  return (
    <>
      <NostrProvider relayUrls={relayUrls} debug={true}>
        <GenerateNoteImageComponent noteId={id.toString()}/>
      </NostrProvider>
    </>
  );

  // return (
  //   <>
  //     <NostrProvider relayUrls={relayUrls} debug={false}>
  //       <div>
  //         <h1>Image Generator</h1>
  //         <input
  //           type="text"
  //           placeholder="Image URL"
  //           value={imageUrl}
  //           onChange={(e) => setImageUrl(e.target.value)}
  //         />
  //         <input
  //           type="text"
  //           placeholder="Text"
  //           value={text}
  //           onChange={(e) => setText(e.target.value)}
  //         />
  //         <button onClick={() => setImageUrl(imageUrl)}>Generate Image</button>
  //         {image && (
  //           <>
  //             <img src={image} alt="Generated" />
  //             <button onClick={handleDownloadImage}>Download Image</button>
  //           </>
  //         )}
  //       </div>
  //     </NostrProvider>
  //   </>
  // );
}