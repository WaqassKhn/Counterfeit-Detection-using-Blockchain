const dummyNfcTags = [
  {
    tagId: "NFC-AX1001",
    serialId: "AX1001",
    batchNumber: "BATCH-APR-01",
    manufactureDate: "2026-04-01"
  },
  {
    tagId: "NFC-AX1002",
    serialId: "AX1002",
    batchNumber: "BATCH-APR-02",
    manufactureDate: "2026-04-02"
  }
];

function getDummyNfcTags() {
  return dummyNfcTags;
}

function readDummyTag(tagId) {
  return dummyNfcTags.find((tag) => tag.tagId === tagId) || null;
}

module.exports = {
  getDummyNfcTags,
  readDummyTag
};
