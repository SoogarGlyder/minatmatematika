// File: src/app/[topicSlug]/[packetSlug]/cbt/page.jsx
import React from 'react';
import PacketPageContent from '../page.jsx'; 

export default async function CbtPage(props) {
  return <PacketPageContent {...props} />;
}