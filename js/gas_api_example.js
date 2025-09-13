const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCLZMxB09bmruok
GGFcPdhFo/114a901OkNspHzelN9G9aZmh8KbyM3PpJhsjwxgcE66CHutc/89ddU
qlbqepfOhCPcTxglYdVF2v/MMYAsvQDlGwg+5AbbIVeoAB3NdObQUdD22eW8X9jV
bOAYuFV0ORoGjY5jLSBqfphY+9Fz/3sJFc4bejwfjKfUWcjknx2ccNv7S/VyGrx1
woSphCSq8uR5Kw0Y8WNY0fStuhQka+BdW2m0F/sFulmMhNCbw5jgAFyRUnUdlSSp
r1QBIZ6ZQalIa6D0hlE0961RAUZth0eE3O7GFlvkaki4wAUlnBlCHrm2J3RZlItZ
yrTblEI3AgMBAAECggEAJnxtks0429c2aUHb+7pNkKi+7cGijmjMcc44UteW3oeF
oEI3yMs3l2SsyNGLogWXwrpdyAklxEtiKQug1LuFV20Pc5/Y5FVXK6LUFl4ia/fB
HABzLd4KcI0LpSRnFhdtNN4qCkXOEs0J0p9tXhXi7iRn5aBGzGYkuZJ7YLIiOdrL
HDdd5Lx0XsuZPbjofsLMfl5sKyMP2rZxrGaC+70zMGoWIUelgfk/ACU+5YdNsVSR
4vi3nY1g5WZ55CyfyX/NPPvfeMKYUmNmb9N4v0Arg9zRwBuGL0yxbWkZjb4jaY2F
X1zo8ZysFGBKrsz1jLTegAUcIVLpI5HvtSTNmqMfNQKBgQC/nvo01hgyn5rQu5vx
6JevDKh9gWJGXPb1KY5IlImCKUm3BovS/l0NtI0vyOWaWMiL4FRzSeKCgr3U/s2d
ONiEFoEfvRw5VnEn0QN/JgIAXmUitM1QXItPTcAlveqRMixsUItY4njkfbCaauDv
kyNKIww5z7evQtYKLgFyNjySVQKBgQC6OdXZCMvpaKEavZHxVSgsd5dEoIiQwngW
dScUKPQOmF1JjfV/QA3CeB3RuOBmO+mSTqfk6skVhYjq+bpXlQk/ktIaTltxAoCR
NnHxsYItDY/iecQoDFPuXtgv5Rg0lsXWRoQafYzY0PbMliiJEtn9BqTvkFFGRiVS
IpNhpuVGWwKBgQCRvWNFjlQnJJcGDLrF2YaMX89CbYaGR6yYuDt8XmTbd3WWW8c6
+bVieCEt59khdEdLg5oXeWlqo++nsQhHfPXIOKmKrzVpMqKrit/i89Bv4VuAcwz5
Avn9nf/3dKOUPRnmY7goKU+TUTlhqMpdzIX5nABvc9mb1fSfF3CIIlIdZQKBgAZh
0QhdGs/m/A50jLnelz/e4VpCvitn3sG2Rh6UwLh3VEsfCFjSEyalAzCay2X1i62t
8GcR/M42A1k6Mb6qpuR83aJ1KQEYett/KCyGTtXIbzPtxGEy+vViXrpVeZzjxefw
Brr5rogHsU2Vn9ICyWG4hpKHOaHU6ZaFBNQF6jmdAoGAcSnpborvadIz6XBoIuPD
t0lcVwDt6x/BoappIkIZC91XDPI567Hlv42ZWAmTuoiRqniaqkQVO99uFqfGxyqT
n1/KrfWzjP4706yKdep+VO8v0FjKKIWMfyVkSc39zfZXwAYDgZUZdld/8auzzLJz
VZ+QVG+SGP96ihF33mJ2QUg=
-----END PRIVATE KEY-----
`;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const textToSign = data.request;

    // Dùng crypto lib của Apps Script
    const signature = Utilities.computeRsaSha256Signature(
      textToSign,
      PRIVATE_KEY
    );

    // Encode sang Base64 (QZ Tray yêu cầu dạng này)
    const signatureB64 = Utilities.base64Encode(signature);

    return ContentService.createTextOutput(signatureB64);
  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err);
  }
}

function doPost(e) {
  return handleApi(e);
}

function handleApi(e) {
  var params = e.parameter || {};
  var action = params.action;
  var result = {};
  if (action === 'loadProcedure') {
    result = loadProcedure();
  } else if (action === 'login') {
    result = login(params.username, params.password);
  } else if (action === 'getCounterById') {
    result = getCounterById(params.id);
  } else if (action === 'updateCounterById') {
    result = updateCounterById(params.id, params.counter);
  } else if (action === 'getScheduleById') {
    result = getScheduleById(params.id);  
  } else if (action === 'callCounterById') {
    result = callCounterById(params.id, params.counter);
  } else if (action === 'updateProcessing') {
    result = updateProcessing(params.id, params.counter, params.type);
  } else {
    result = { error: 'Unknown action' };
  }
  // Trả về header cho phép CORS
  return ContentService
    .createTextOutput(result)
    .setMimeType(ContentService.MimeType.JSON);
}

// Lấy toàn bộ dữ liệu của 1 dòng trong sheet schedule theo id
function getScheduleById(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('schedule');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  let result = { success: false };
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][headers.indexOf('id')]) === String(id)) {
      result = { success: true };
      headers.forEach(function(h, idx) {
        result[h] = data[i][idx];
      });
      break;
    }
  }
  return JSON.stringify(result);
}

// Tăng giá trị counter hiện tại lên 1 trong sheet schedule theo id truyền vào và thêm vào cột queue
function updateCounterById(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('schedule');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idIdx = headers.indexOf('id');
  const counterIdx = headers.indexOf('counter');
  const queueIdx = headers.indexOf('queue');
  const statusIdx = headers.indexOf('status');
  let updated = false;
  let newValue = null;

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(id)) {
      let currentVal = parseInt(data[i][counterIdx], 10) || 0;
      newValue = currentVal + 1;
      // Update queue trước khi tăng counter
      let queueStr = (queueIdx >= 0 && data[i][queueIdx]) ? String(data[i][queueIdx]) : '';
      let queueArr = queueStr ? queueStr.split(',') : [];
      queueArr.push(currentVal);
      let newQueueStr = queueArr.join(',');
      if (queueIdx >= 0) {
        sheet.getRange(i + 2, queueIdx + 1).setValue(newQueueStr);
      }
      // Update counter
      sheet.getRange(i + 2, counterIdx + 1).setValue(newValue);
      // Update status thành 'processing'
      if (statusIdx >= 0) {
        sheet.getRange(i + 2, statusIdx + 1).setValue('processing');
      }
      updated = true;
      break;
    }
  }
  return JSON.stringify({ success: updated, counter: newValue });
}

// Gọi số: cập nhật counter vào cột processing, trả về text để phát âm thanh
function callCounterById(id, counter) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('schedule');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idIdx = headers.indexOf('id');
  const processingIdx = headers.indexOf('processing');
  const statusIdx = headers.indexOf('status');
  let updated = false;

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(id)) {
      // Cập nhật processing
      if (processingIdx >= 0) {
        sheet.getRange(i + 2, processingIdx + 1).setValue(counter);
      }
      // Update status thành 'processing'
      if (statusIdx >= 0) {
        sheet.getRange(i + 2, statusIdx + 1).setValue('processing');
      }
      updated = true;
      break;
    }
  }
  if (updated) {
    text = `${counter}`;
  }
  return JSON.stringify({ success: updated, text: text });
}

// Lấy giá trị cột counter từ sheet schedule theo id truyền vào
function getCounterById(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('schedule');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idIdx = headers.indexOf('id');
  const counterIdx = headers.indexOf('counter');
  let result = { success: false, counter: null };
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(id)) {
      result = { success: true, counter: data[i][counterIdx] };
      break;
    }
  }
  return JSON.stringify(result);
}

function loadProcedure() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('procedure');
  const data = sheet.getDataRange().getValues();
  let result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      id: data[i][0],
      name: data[i][1]
    });
  }
  return JSON.stringify(result);
}

function login(username, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('user');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  let result = { success: false, message: "Sai tài khoản hoặc mật khẩu" };
  const usernameIdx = headers.indexOf('username');
  const passwordIdx = headers.indexOf('password');
  const roleIdx = headers.indexOf('role');
  const idIdx = headers.indexOf('id');

  for (var i = 0; i < data.length; i++) {
    if (data[i][usernameIdx] == username && data[i][passwordIdx] == password) {
      result = { success: true, message: "Đăng nhập thành công", role: data[i][roleIdx], id: data[i][idIdx] };
      break;
    }
  }
  return JSON.stringify(result);
}

// Đặt processing='' và xoá số counter truyền vào khỏi queue
function updateProcessing(id, counter, type) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('schedule');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idIdx = headers.indexOf('id');
  const processingIdx = headers.indexOf('processing');
  const queueIdx = headers.indexOf('queue');
  const doneIdx = headers.indexOf('done');
  const skipIdx = headers.indexOf('skip');
  const statusIdx = headers.indexOf('status');

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(id)) {
      // Xoá số counter khỏi queue
      if (queueIdx >= 0) {
        let queueStr = data[i][queueIdx] ? String(data[i][queueIdx]) : '';
        let queueArr = queueStr ? queueStr.split(',') : [];
        queueArr = queueArr.filter(num => String(num) !== String(counter));
        sheet.getRange(i + 2, queueIdx + 1).setValue(queueArr.join(','));
      }
      // Set processing = ''
      if (processingIdx >= 0) {
        sheet.getRange(i + 2, processingIdx + 1).setValue('');
      }
      // Set status = 'waiting'
      if (statusIdx >= 0) {
        sheet.getRange(i + 2, statusIdx + 1).setValue('waiting');
      }
      // Cộng vào done hoặc skip
      if (type == 1 && doneIdx >= 0) {
        let doneVal = parseInt(data[i][doneIdx], 10) || 0;
        sheet.getRange(i + 2, doneIdx + 1).setValue(doneVal + 1);
      } else if (type == 0 && skipIdx >= 0) {
        let skipVal = parseInt(data[i][skipIdx], 10) || 0;
        sheet.getRange(i + 2, skipIdx + 1).setValue(skipVal + 1);
      }
      updated = true;
      break;
    }
  }
  return JSON.stringify({ success: updated });
}

// Hàm tự động reset bảng schedule mỗi ngày và ghi lịch sử sang bảng history
function dailyUpdate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName('schedule');
  var historySheet = ss.getSheetByName('history');
  var scheduleData = scheduleSheet.getDataRange().getValues();
  var headers = scheduleData.shift();
  var counterIdx = headers.indexOf('counter');
  var processingIdx = headers.indexOf('processing');
  var queueIdx = headers.indexOf('queue');
  var statusIdx = headers.indexOf('status');
  var doneIdx = headers.indexOf('done');
  var skipIdx = headers.indexOf('skip');
  var idIdx = headers.indexOf('id');
  var nameIdx = headers.indexOf('name');
  var startCounter = 1000;

  // --- Ghi lịch sử sang bảng history trước khi reset ---
  var now = new Date();
  now.setDate(now.getDate() - 1);
  var dd = String(now.getDate()).padStart(2, '0');
  var mm = String(now.getMonth() + 1).padStart(2, '0');
  var yyyy = now.getFullYear();
  var dateStr = dd + '/' + mm + '/' + yyyy;
  var historyHeaders = historySheet.getDataRange().getValues()[0];
  var historyIdIdx = historyHeaders.indexOf('id');
  var historyNameIdx = historyHeaders.indexOf('name');
  var historyDoneIdx = historyHeaders.indexOf('done');
  var historySkipIdx = historyHeaders.indexOf('skip');
  var historyDateIdx = historyHeaders.indexOf('date');
  for (var i = 0; i < scheduleData.length; i++) {
    var row = scheduleData[i];
    var id = row[idIdx];
    var done = row[doneIdx];
    var skip = row[skipIdx];
    var historyRow = [];
    historyRow[historyIdIdx] = id;
    historyRow[historyNameIdx] = row[nameIdx];
    historyRow[historyDoneIdx] = done;
    historyRow[historySkipIdx] = skip;
    historyRow[historyDateIdx] = dateStr;
    historySheet.appendRow(historyRow);
  }

  // --- Reset bảng schedule ---
  for (var i = 0; i < scheduleData.length; i++) {
    if (counterIdx >= 0) scheduleSheet.getRange(i + 2, counterIdx + 1).setValue(startCounter + i * 1000);
    if (processingIdx >= 0) scheduleSheet.getRange(i + 2, processingIdx + 1).setValue('');
    if (queueIdx >= 0) scheduleSheet.getRange(i + 2, queueIdx + 1).setValue('');
    if (statusIdx >= 0) scheduleSheet.getRange(i + 2, statusIdx + 1).setValue('waiting');
    if (doneIdx >= 0) scheduleSheet.getRange(i + 2, doneIdx + 1).setValue(0);
    if (skipIdx >= 0) scheduleSheet.getRange(i + 2, skipIdx + 1).setValue(0);
  }
}