// ==========================================================================
//  Receptor de W-9 para Google Drive
// ==========================================================================

// CONFIGURACIÓN
var FOLDER_ID = "ID_DE_CARPETA";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var fileName = data.fileName || "W9_sin_nombre.pdf";
    var base64 = data.base64;

    var decoded = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decoded, "application/pdf", fileName);

    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", fileId: file.getId(), fileName: fileName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
