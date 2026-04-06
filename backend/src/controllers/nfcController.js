const { getDummyNfcTags, readDummyTag } = require("../data/nfcTags");

function getTags(req, res) {
  res.json({ tags: getDummyNfcTags() });
}

function readTag(req, res) {
  const tag = readDummyTag(req.params.tagId);

  if (!tag) {
    return res.status(404).json({ error: "Dummy NFC tag not found" });
  }

  return res.json({
    tag,
    source: "dummy-nfc-simulator"
  });
}

module.exports = {
  getTags,
  readTag
};
