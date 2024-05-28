import React, { useState, useEffect } from 'react';

const BingDictScrape = ({ text }) => {
    const [translation, setTranslation] = useState('');

    // Function to concatenate the text content of each node
    function extractTextContent(node) {
        // let text = '';
        // node.childNodes.forEach(child => {
        //     if (child.nodeType === Node.TEXT_NODE) {
        //         console.log("Node.TEXT_NODE, textContent:", child.textContent)
        //         text += child.textContent + " ";
        //     } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'a') {
        //         console.log("tag a, type, textContent:", child.nodeType, child.textContent);
        //         text += child.textContent;
        //     } else {
        //         console.log("else: nodeName nodeType, textContent:",child.nodeName.toLowerCase(), child.nodeType, child.textContent)
        //     }
        // });
        // return text;
        // document.getElementById("def b_regtxt").textContent;
        // return document.getElementsByClassName('def b_regtxt').textContent;
        console.log('node.textContent ', translation);
        if (node === null || node === undefined) {
            setTranslation("");
            console.log("Not Found!");
        } else {
            let translation = node.textContent;
            setTranslation(translation);
        }
    }

    useEffect(() => {
        chrome.runtime.sendMessage({ action: 'fetchTranslation', text: text }, response => {
            if (response.error) {
                console.error('Error fetching translation:', response.error);
            } else {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.result, 'text/html');
                // Select the span with class 'def b_regtxt' within the first &lt;li&gt; element
                const defSpan = doc.querySelector('li > span.def.b_regtxt');
                console.log('defSpan:', defSpan);
                // Get the concatenated text content
                const result = extractTextContent(defSpan);

                console.log("BingDictScrape, result=",result);
                // const links = doc.querySelectorAll('span.def.b_regtxt > a');

                // if (links.length > 0) {
                //     const words = Array.from(links).map(link => link.textContent);
                //     const str = words.join(', ');
                //     console.log('Found words:', words);
                //     setTranslation(str);
                // } else {
                //     console.error('The specified elements were not found.');
                //     setTranslation('not found!');
                // }
            }
        });
    }, [text]);

    return <span style={{ color:'grey'}}>{translation}</span>;
};

export default BingDictScrape;
