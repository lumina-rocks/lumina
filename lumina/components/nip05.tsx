import { CheckIcon, ReloadIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect } from 'react';

interface NIP05Props {
    nip05: string;
    pubkey: string;
}

const NIP05: React.FC<NIP05Props> = ({ nip05, pubkey }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);

    let name = nip05.split('@')[0]
    let domain = nip05.split('@')[1]

    useEffect(() => {
        if(nip05.length > 0) {
            fetch(`https://${domain}/.well-known/nostr.json?name=${name}`)
            .then(response => response.json())
            .then(data => {
                if (data.names[name] === pubkey) {
                    setIsValid(true);
                } else {
                    setIsValid(false);
                }
                setIsLoading(false);
            })
        }
    }, [nip05, pubkey]);

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {nip05.length > 0 && 
                <>
                    { name === "_" ? domain : nip05 }
                    {isLoading ? <ReloadIcon className="mx-2 h-4 w-4 animate-spin" /> : isValid ? <CheckIcon className="mx-2 h-4 w-4" /> : <span className="mx-2 text-red-500">❌</span>}
                </>
                }
            </div>
        </>
    );
}

export default NIP05;