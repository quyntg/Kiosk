let queue = [
    { number: 'A001', name: 'Nguyễn Văn A' },
    { number: 'A002', name: 'Trần Thị B' }
];
let current = null;
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function loadPage(url, id) {
	const app = document.getElementById(id);
    fetch(url)
    .then(res => res.text())
    .then(html => {
        app.innerHTML = html;
        // Nếu là trang login thì luôn ẩn spinner khi load
        if (url.includes('login')) {
            setTimeout(() => {
                var spinner = document.getElementById('loginSpinner');
                if (spinner) {
                    spinner.style.display = 'none';
                    spinner.innerHTML = '';
                }
            }, 10);
        }
    })
    .catch(() => {
        
    });
}

function login(username, password) {
    var errorMsg = document.getElementById('errorMsg');
    var btn = document.getElementById('loginBtn');
    var btnText = document.getElementById('loginBtnText');
    var spinner = document.getElementById('loginSpinner');
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
    btn.disabled = true;
    btnText.style.opacity = '0.5';
    if (typeof spinnerSVG !== 'undefined') spinner.innerHTML = spinnerSVG;
    spinner.style.display = '';
    
    if (!username || !password) {
        if (errorMsg) {
            errorMsg.textContent = 'Vui lòng nhập đầy đủ thông tin';
            errorMsg.style.display = '';
        }
        return;
    }
    fetch(ggAPIUrl + '?action=login&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password))
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Xoá param username/password khỏi URL sau khi đăng nhập thành công
            if (window.history && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
            }
            // Chuyển đến trang chính
            if (data.role === 'admin') {
                page('/admin');
            } else if (data.role === 'gate') {
                page('/gate');
            } else if (data.role === 'desk') {
                sessionStorage.setItem('deskId', data.id);
                page('/desk');
            }
        } else {
            if (errorMsg) {
                errorMsg.textContent = data.message || 'Đăng nhập thất bại';
                errorMsg.style.display = '';
            }
        }
    })
    .catch(() => {
        errorMsg.textContent = 'Lỗi kết nối máy chủ.';
        errorMsg.style.display = '';
    })
    .finally(() => {
        btn.disabled = false;
        btnText.style.opacity = '1';
        spinner.style.display = 'none';
        spinner.innerHTML = '';
    });
}

function loadProcedureList() {
    var container = document.getElementById('gateContainer');
    // Xóa nội dung cũ
    container.innerHTML = '';
    // Hiển thị spinner loading ở giữa màn hình
    if (typeof orangeSpinnerSVG !== 'undefined') {
        var overlay = document.createElement('div');
        overlay.id = 'procedureLoadingOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(255,255,255,0.6)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = 1000;
        overlay.innerHTML = orangeSpinnerSVG;
        document.body.appendChild(overlay);
    }

    fetch(ggAPIUrl + '?action=loadProcedure')
    .then(res => res.json())
    .then(data => {
        // Xóa spinner loading
        var overlay = document.getElementById('procedureLoadingOverlay');
        if (overlay) overlay.remove();

        if (data && Array.isArray(data)) {
           deskList = data;
            if (typeof deskList !== 'undefined' && Array.isArray(deskList)) {
                deskList.forEach(function(item) {
                    var div = document.createElement('div');
                    div.className = 'desk-block';
                    div.textContent = item.name;
                    div.onclick = function() {
                        initDeskFunction(this, item.id, item.name);
                    };
                    container.appendChild(div);
                });
           }
        }
    })
    .catch(() => {
        var overlay = document.getElementById('procedureLoadingOverlay');
        if (overlay) overlay.remove();
        container.innerHTML = '<div style="color: red; text-align: center; padding: 24px 0;">Không tải được danh sách thủ tục</div>';
    });
}

function showModalConfirm(name, id) {
    var modal = document.getElementById('modalConfirm');
    var modalFieldName = document.getElementById('modalFieldName');
    var btnConfirm = document.getElementById('btnConfirm');
    var btnCancel = document.getElementById('btnCancel');
    modalFieldName.textContent = name;
    modal.style.display = '';
    // Xoá spinner cũ nếu có
    let spinnerEl = btnConfirm.querySelector('.spinner-inline');
    if (spinnerEl) spinnerEl.remove();
    btnConfirm.disabled = false;
    btnConfirm.innerHTML = 'Xác nhận';

        btnConfirm.onclick = function() {
            btnConfirm.disabled = true;
            if (typeof spinnerSVG !== 'undefined') {
                btnConfirm.innerHTML = `<span class="spinner-inline" style="vertical-align:middle;display:inline-block;width:1.2em;height:1.2em;">${spinnerSVG}</span> Đang xử lý...`;
            } else {
                btnConfirm.innerHTML = 'Đang xử lý...';
            }
            fetch(ggAPIUrl + '?action=getCounterById&id=' + encodeURIComponent(id))
                .then(res => res.json())
                .then(data => {
                    if (data && data.success && data.counter) {
                        // Sau khi lấy số thành công, gọi updateCounterById
                        fetch(ggAPIUrl + '?action=updateCounterById&id=' + encodeURIComponent(id))
                            .then(res2 => res2.json())
                            .then(() => {
                                btnConfirm.disabled = false;
                                btnConfirm.innerHTML = 'Xác nhận';
                                modal.style.display = 'none';
                                showResultModal(data.counter);
                            })
                            .catch(() => {
                                btnConfirm.disabled = false;
                                btnConfirm.innerHTML = 'Xác nhận';
                                modal.style.display = 'none';
                                showResultModal(data.counter);
                            });
                    } else {
                        btnConfirm.disabled = false;
                        btnConfirm.innerHTML = 'Xác nhận';
                        modal.style.display = 'none';
                        showResultModal(null);
                    }
                })
                .catch(() => {
                    btnConfirm.disabled = false;
                    btnConfirm.innerHTML = 'Xác nhận';
                    modal.style.display = 'none';
                    showResultModal(null);
                });
        };

    btnCancel.onclick = function() {
        modal.style.display = 'none';
    };
}

async function printWithPrintNode() {
    const apiKey = "cmIEqzm5rM-hHvKxK2v_afDZ2XzGxXjr9s08HkWL9v0"; // thay bằng API Key bạn lấy từ PrintNode
    const printerId = 74718076; // thay bằng ID của máy in (lấy từ PrintNode Dashboard)

    const body = {
        printerId: printerId,
        title: "Test Print",
        contentType: "raw_base64", // raw ESC/POS command
        content: btoa("Hello Thermal Printer\n\n\n") // chuyển sang base64
    };

    const res = await fetch("https://api.printnode.com/printjobs", {
        method: "POST",
        headers: {
        "Authorization": "Basic " + btoa(apiKey + ":"),
        "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Kết quả in:", data);
}

async function listPrinters() {
    const apiKey = "cmIEqzm5rM-hHvKxK2v_afDZ2XzGxXjr9s08HkWL9v0";

    const res = await fetch("https://api.printnode.com/printers", {
        headers: {
        "Authorization": "Basic " + btoa(apiKey + ":")
        }
    });

    const data = await res.json();
    console.log("Danh sách máy in:", data);
}

function removeVietnameseTones(str) {
return str.normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

function buildTicket(counter) {
    let parts = [
        '\x1B\x61\x01', // Căn giữa
        '\x1D\x21\x01', // Font nhỏ
        removeVietnameseTones('UY BAN NHAN DAN XA TAY DO') + '\n',
        removeVietnameseTones('THANH HOA') + '\n',
        '------------------------------------------\n',
        removeVietnameseTones('PHIEU SO THU TU') + '\n',
        '------------------------------------------\n\n',
        '\x1B\x61\x01', // Căn giữa
        '\x1D\x21\x33', // Font lớn
        counter + '\n',
        '\x1D\x21\x01', // Font nhỏ lại
        '\n',
        removeVietnameseTones('Vui long cho den luot') + '\n',
        '\n\n\n', // vài dòng trắng
        '\x1D\x21\x00', // Font thường
        '\x1D\x56\x42\x10' // Feed 16 dòng + cut
    ];

    return parts.join(""); // trả về raw string
}

// Hàm encode sang base64 trong browser
function toBase64(str) {
    return btoa(
        Array.from(str).map(c => String.fromCharCode(c.charCodeAt(0) & 0xFF)).join("")
    );
}

async function printTicket(counter) {
    const apiKey = "cmIEqzm5rM-hHvKxK2v_afDZ2XzGxXjr9s08HkWL9v0"; // thay bằng API Key bạn lấy từ PrintNode
    const printerId = 74718076; // thay bằng ID của máy in (lấy từ PrintNode Dashboard)

    const raw = buildTicket(counter);
    const contentBase64 = toBase64(raw);

    const body = {
        printerId: printerId,
        title: "Queue Ticket",
        contentType: "raw_base64",
        content: contentBase64
    };

    await fetch("https://api.printnode.com/printjobs", {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa(apiKey),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}

// Hiện modal kết quả lấy số
function showResultModal(counter) {
    // Tạo modal nếu chưa có
    let modal = document.getElementById('modalResult');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalResult';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <div id="modalResultMsg" class="modal-title"></div>
                <div class="modal-actions">
                    <button id="btnPrint" class="modal-btn confirm" style="display: none;">In phiếu</button>
                    <button id="btnCloseResult" class="modal-btn cancel">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    const msg = modal.querySelector('#modalResultMsg');
    const btnPrint = modal.querySelector('#btnPrint');
    const btnClose = modal.querySelector('#btnCloseResult');
    if (counter) {
        db.ref("counter").set(counter);
        msg.innerHTML = `Bạn đã lấy số thành công!<br><span style='font-size: 2rem; color: #000; font-weight: 700;'>${counter}</span>`;
        btnPrint.style.display = '';
        btnPrint.onclick = function() {
            btnPrint.disabled = true;
            const oldHtml = btnPrint.innerHTML;
            if (typeof spinnerSVG !== 'undefined') {
                btnPrint.innerHTML = `<span class="spinner-inline">${spinnerSVG}</span> Đang in...`;
            } else {
                btnPrint.innerHTML = 'Đang in...';
            }
            printTicket(counter).then(() => { 
                console.log("✅ In thành công");
            }).finally(() => {
                btnPrint.disabled = false;
                btnPrint.innerHTML = oldHtml;
                // Đóng modal khi in thành công
                modal.style.display = 'none';
            });
        };
    } else {
        msg.innerHTML = `<span style='color: red;'>Lấy số thất bại. Vui lòng thử lại!</span>`;
        btnPrint.style.display = 'none';
    }
    btnClose.onclick = function() {
        modal.style.display = 'none';
    };
    modal.style.display = 'flex';
}

function initDeskFunction(div, id, name) {
    document.querySelectorAll('.desk-block').forEach(e => e.classList.remove('active'));
    div.classList.add('active');
    showModalConfirm(name, id);
}

// Hiển thị spinner overlay toàn màn hình
function showDeskSpinner() {
    let overlay = document.getElementById('deskLoadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'deskLoadingOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(255,255,255,0.6)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = 1000;
        overlay.innerHTML = (typeof orangeSpinnerSVG !== 'undefined' ? orangeSpinnerSVG : (typeof spinnerSVG !== 'undefined' ? spinnerSVG : 'Loading...'));
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }
}

function hideDeskSpinner() {
    let overlay = document.getElementById('deskLoadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// Load queue từ backend và render
function loadDeskQueue(type) {
    const deskId = sessionStorage.getItem('deskId');
    if (!deskId) {
        hideDeskSpinner();
        return;
    }
    // Lưu queue cũ để so sánh
    const oldQueue = Array.isArray(queue) ? queue.map(item => item.number) : [];
    getScheduleById(deskId).then(data => {
        let newQueueArr = [];
        if (data && data.success && typeof data.queue === 'string') {
            newQueueArr = data.queue.split(',').filter(x => x);
            queue = newQueueArr.map(num => ({ number: num, name: '' }));
        } else {
            queue = [];
        }
        // So sánh queue cũ và mới, nếu có số mới thì thông báo
        const added = newQueueArr.filter(num => !oldQueue.includes(num));
        if (added.length > 0 && type == 1) {
            showNewTicketNotification(added);
        }
        renderQueue();
        hideDeskSpinner();
    }).catch(() => {
        queue = [];
        renderQueue();
        hideDeskSpinner();
    });
}

// Hiện thông báo khi có số mới vào queue ở quầy
function showNewTicketNotification(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return;
    let msg = 'Có số mới: ' + numbers.join(', ');
    let notif = document.getElementById('newTicketNotif');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'newTicketNotif';
        notif.style.position = 'fixed';
        notif.style.top = '30px';
        notif.style.right = '30px';
        notif.style.background = 'rgba(77, 206, 94, 0.95)';
        notif.style.color = '#fff';
        notif.style.padding = '16px 28px';
        notif.style.borderRadius = '8px';
        notif.style.fontSize = '1.3rem';
        notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        notif.style.zIndex = 9999;
        document.body.appendChild(notif);
    }
    notif.textContent = msg;
    notif.style.display = 'block';
    // Phát tiếng chuông ting nếu có file mp3AlertUrl
    if (typeof mp3AlertUrl !== 'undefined' && mp3AlertUrl) {
        try {
            const audio = new Audio(mp3AlertUrl);
            audio.play();
        } catch (e) {}
    }
    setTimeout(() => {
        notif.style.display = 'none';
    }, 3500);
}

// Lấy toàn bộ dữ liệu schedule theo id từ backend
function getScheduleById(id) {
    return fetch(ggAPIUrl + '?action=getScheduleById&id=' + encodeURIComponent(id))
        .then(res => res.json());
}


// Phát chuỗi file mp3: ting, moi, các số, denquay, số quầy
// textArr: mảng chuỗi số, ví dụ ['1','0','0','0']
// deskId: số quầy (chuỗi)
function playQueueAudio(textArr, deskId) {
    // Cần các biến mp3AlertUrl, mp3BeforeUrl, mp3AfterUrl, mp3So, mp3QuayPrefix (object hoặc function trả về url)
    // mp3So: object, key là số, value là url file mp3 số
    // mp3QuayPrefix: object, key là deskId, value là url file mp3 số quầy
    function playMp3(url) {
        return new Promise(resolve => {
            if (!url) return resolve();
            const audio = new Audio(url);
            audio.playbackRate = 1; // tăng tốc độ phát
            audio.onended = resolve;
            audio.onerror = resolve;
            audio.currentTime = 0;
            if (audio.readyState >= 1) {
                audio.play();
            } else {
                audio.onloadedmetadata = () => {
                    audio.currentTime = 0;
                    audio.play();
                };
            }
        });
    }
    // Xây dựng chuỗi file mp3 cần phát
    let files = [];
    if (typeof mp3BeforeUrl !== 'undefined') files.push(mp3BeforeUrl);
    if (Array.isArray(textArr)) {
        textArr.forEach(num => {
            if (num == '0') files.push(mp30);
            if (num == '1') files.push(mp31);
            if (num == '2') files.push(mp32);
            if (num == '3') files.push(mp33);
            if (num == '4') files.push(mp34);
            if (num == '5') files.push(mp35);
            if (num == '6') files.push(mp36);
            if (num == '7') files.push(mp37);
            if (num == '8') files.push(mp38);
            if (num == '9') files.push(mp39);
        });
    }
    if (typeof mp3AfterUrl !== 'undefined') files.push(mp3AfterUrl);
    if (deskId == '0') files.push(mp30);
    if (deskId == '1') files.push(mp31);
    if (deskId == '2') files.push(mp32);
    if (deskId == '3') files.push(mp33);
    if (deskId == '4') files.push(mp34);
    if (deskId == '5') files.push(mp35);
    if (deskId == '6') files.push(mp36);
    if (deskId == '7') files.push(mp37);
    if (deskId == '8') files.push(mp38);
    if (deskId == '9') files.push(mp39);
    if (typeof mp3EndUrl !== 'undefined') files.push(mp3EndUrl);
    // Phát lần lượt từng file
    let p = Promise.resolve();
    files.forEach(url => {
        p = p.then(() => playMp3(url));
    });
    return p;
}

// Máy desk lắng nghe callQueue và phát tiếng lần lượt
// Sửa: Phát lần lượt các số trong callQueue, không bị mất số khi nhiều số được thêm cùng lúc
let audioQueue = [];
let isPlayingAudio = false;
function listenCallQueueAndPlay() {
    if (typeof db === 'undefined' || !db.ref) return;
    db.ref('callQueue').on('child_added', function processQueue(snapshot) {
        const callData = snapshot.val();
        if (!callData.played) {
            // Đánh dấu đã phát để tránh phát lại
            snapshot.ref.update({ played: true });
            audioQueue.push({
                counter: callData.counter,
                deskId: callData.deskId
            });
            playNextAudioInQueue();
        }
    });
}

function playNextAudioInQueue() {
    if (isPlayingAudio || audioQueue.length === 0) return;
    isPlayingAudio = true;
    const item = audioQueue.shift();
    const textArr = item.counter.toString().split("");
    playQueueAudio(textArr, item.deskId).then(() => {
        setTimeout(() => {
            isPlayingAudio = false;
            playNextAudioInQueue();
        }, 2000);
    });
}

function renderQueue() {
    const queueList = document.getElementById('queueList');
    queueList.innerHTML = '';
    queue.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'queue-item';
        div.innerHTML = `
            <span class="ticket-number">${item.number}</span>
            <span class="ticket-name"></span>
            <button class="btn-call">Gọi số</button>
            <button class="btn-skip">Bỏ qua</button>
        `;
        div.querySelector('.btn-call').onclick = () => {
            // Gọi API callCounterById
            showModal('Gọi số', item, () => {
                initSpinner();
                const deskId = sessionStorage.getItem('deskId');
                fetch(ggAPIUrl + '?action=callCounterById&id=' + encodeURIComponent(deskId) + '&counter=' + encodeURIComponent(item.number))
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.success && data.text) {
                            const modal = document.getElementById('modalConfirm');
                            modal.style.display = 'none';
                            // Đẩy vào hàng đợi callQueue trên Firebase
                            db.ref('callQueue').push({ counter: data.text, deskId: deskId.replace('desk', ''), timestamp: Date.now(), played: false });
                            callTicket(idx, false);                 
                        }
                    }); 
            });
        };
        div.querySelector('.btn-skip').onclick = () => {
            showModal('Bỏ qua', item, () => {
                initSpinner();
                const deskId = sessionStorage.getItem('deskId');
                fetch(ggAPIUrl + '?action=updateProcessing&id=' + encodeURIComponent(deskId) + '&counter=' + encodeURIComponent(item.number) + '&type=0')
                    .then(res => res.json())
                    .then(() => {
                        // Xoá khỏi queue local
                        queue.splice(idx, 1);
                        renderQueue();
                        const modal = document.getElementById('modalConfirm');
                        modal.style.display = 'none';
                    });
            });
        };
        queueList.appendChild(div);
    });
}

function renderCurrent() {
    const num = document.getElementById('currentTicketNumber');
    const name = document.getElementById('currentTicketName');
    const btn = document.getElementById('btnComplete');
    const btnRecall = document.getElementById('btnRecall');
    const btnReskip = document.getElementById('btnReskip');
    if (current) {
        num.textContent = current.number;
        name.textContent = current.name;
        btn.style.display = '';
        if (btnRecall) btnRecall.style.display = '';
        if (btnReskip) btnReskip.style.display = '';
        // Gán sự kiện gọi lại với hiệu ứng spinner và logic hàng đợi
        if (btnRecall) btnRecall.onclick = () => {
            btnRecall.disabled = true;
            const oldHtml = btnRecall.innerHTML;
            btnRecall.innerHTML = `<span class="spinner-inline">${typeof spinnerSVG !== 'undefined' ? spinnerSVG : '🔄'}</span> Đang gọi...`;
            const deskId = sessionStorage.getItem('deskId');
            fetch(ggAPIUrl + '?action=callCounterById&id=' + encodeURIComponent(deskId) + '&counter=' + encodeURIComponent(current.number))
                .then(res => res.json())
                .then(data => {
                    if (data && data.success && data.text) {
                        // Đẩy vào hàng đợi phát âm thanh
                        audioQueue.push({
                            counter: data.text,
                            deskId: deskId.replace('desk', '')
                        });
                        playNextAudioInQueue();
                    }
                })
                .finally(() => {
                    setTimeout(() => {
                        btnRecall.disabled = false;
                        btnRecall.innerHTML = oldHtml;
                    }, 1000);
                });
        };
        if (btnReskip) {
            btnReskip.onclick = () => {
                showModal('Bỏ qua', current, () => {
                    initSpinner();
                    const deskId = sessionStorage.getItem('deskId');
                    fetch(ggAPIUrl + '?action=updateProcessing&id=' + encodeURIComponent(deskId) + '&counter=' + encodeURIComponent(current.number) + '&type=0')
                        .then(res => res.json())
                        .then(() => {
                            current = null;
                            renderCurrent();
                            loadDeskQueue(1);
                            const modal = document.getElementById('modalConfirm');
                            modal.style.display = 'none';
                        });
                });
            };
        }
        if (btn) {
            btn.onclick = () => {
                showModal('Hoàn thành', current, () => {
                    initSpinner();
                    const deskId = sessionStorage.getItem('deskId');
                    fetch(ggAPIUrl + '?action=updateProcessing&id=' + encodeURIComponent(deskId) + '&counter=' + encodeURIComponent(current.number) + '&type=1')
                        .then(res => res.json())
                        .then(() => {
                            current = null;
                            renderCurrent();
                            loadDeskQueue(1);
                            const modal = document.getElementById('modalConfirm');
                            modal.style.display = 'none';
                        });
                });
            };
        }
    } else {
        num.textContent = '--';
        name.textContent = 'Chưa có hồ sơ';
        btn.style.display = 'none';
        if (btnRecall) btnRecall.style.display = 'none';
        if (btnReskip) btnReskip.style.display = 'none';
    }
}

function callTicket(idx, removeFromQueue = false) {
    current = queue[idx];
    if (removeFromQueue) queue.splice(idx, 1);
    renderQueue();
    renderCurrent();
}

function skipTicket(idx) {
    queue.splice(idx, 1);
    renderQueue();
}

function completeTicket() {
    current = null;
    renderCurrent();
}

function initSpinner() {
    const btnOk = document.getElementById('modalOk');
    btnOk.disabled = true;
    if (typeof spinnerSVG !== 'undefined') {
        btnOk.innerHTML = `<span class="spinner-inline">${spinnerSVG}</span> Đang xử lý...`;
    } else {
        btnOk.innerHTML = 'Đang xử lý...';
    }
}

function showModal(action, item, onOk) {
    const modal = document.getElementById('modalConfirm');
    const msg = document.getElementById('modalMsg');
    msg.textContent = `Xác nhận ${action.toLowerCase()} cho số ${item.number} ?`;
    modal.style.display = 'flex';
    const btnOk = document.getElementById('modalOk');
    const btnCancel = document.getElementById('modalCancel');
    btnOk.disabled = false;
    btnOk.innerHTML = 'Xác nhận';
    btnOk.onclick = () => {
        // Chỉ gọi onOk, hiệu ứng spinner sẽ được xử lý trong onOk (ở renderCurrent)
        onOk();
    };
    btnCancel.onclick = () => {
        modal.style.display = 'none';
    };
}