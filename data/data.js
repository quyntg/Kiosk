// Đường dẫn file mp3 phát trước và sau khi phát voice (có thể thay đổi tuỳ ý)
var mp3BeforeUrl = './data/xin moi.mp3';
var mp3AfterUrl = './data/den quay so.mp3';
var mp3EndUrl = './data/phuc vu.mp3';
var mp30 = './data/0.mp3'; // file mp3 đọc số 0
var mp31 = './data/1.mp3'; // file mp3 đọc số 1
var mp32 = './data/2.mp3'; // file mp3 đọc số 2
var mp33 = './data/3.mp3'; // file mp3 đọc số 3
var mp34 = './data/4.mp3'; // file mp3 đọc số 4
var mp35 = './data/5.mp3'; // file mp3 đọc số 5
var mp36 = './data/6.mp3'; // file mp3 đọc số 6
var mp37 = './data/7.mp3'; // file mp3 đọc số 7
var mp38 = './data/8.mp3'; // file mp3 đọc số 8
var mp39 = './data/9.mp3'; // file mp3 đọc số 9
var ggAPIUrl = 'https://script.google.com/macros/s/AKfycbxbqzFia4P-R5VNbt4aSMgFuNuxX-paztgm0ZzzAH88fTWiAWbL6KdpVusx7xAn3dPN/exec';

var deskList = [
    { name: "Lĩnh vực nông nghiệp - tài nguyên", id: "desk1" },
    { name: "Lĩnh vực kinh doanh", id: "desk2" },
    { name: "Lĩnh vực kinh tế, hạ tầng và đô thị", id: "desk3" },
    { name: "Lĩnh vực tư pháp - hộ tịch", id: "desk4" },
    { name: "Lĩnh vực văn hoá - xã hội - y tế", id: "desk5" },
    { name: "Lĩnh vực giáo dục - nội vụ", id: "desk6" },
    { name: "Lĩnh vực tạm 1", id: "desk7" },
    { name: "Lĩnh vực tạm 2", id: "desk8" }
]

const spinnerSVG = `
    <svg width="24" height="24" viewBox="0 0 50 50">
        <path d="M25 7
            a 18 18 0 0 1 0 36" 
            stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" stroke-dasharray="40 80" filter="drop-shadow(0 0 3px #fff)">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"/>
        </path>
    </svg>
`;

const orangeSpinnerSVG = `
    <svg width="64" height="64" viewBox="0 0 50 50">
        <path d="M25 7
            a 18 18 0 0 1 0 36" 
            stroke="#ff9800" stroke-width="8" stroke-linecap="round" fill="none" 
            stroke-dasharray="40 80" filter="drop-shadow(0 0 6px #ff9800)">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.7s" repeatCount="indefinite"/>
        </path>
    </svg>
`;
