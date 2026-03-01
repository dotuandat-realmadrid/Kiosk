// import React, { useState } from "react";

// const VirtualKeyboard = ({ onKeyPress, onClose, currentValue = "" }) => {
//   const [isShift, setIsShift] = useState(false);
//   const [isCapsLock, setIsCapsLock] = useState(false);
  
//   // Bảng chuyển đổi ký tự có dấu mũ/móc
//   const vowelTransforms = {
//     'a': { 'a': 'â', 'w': 'ă' },
//     'e': { 'e': 'ê' },
//     'o': { 'o': 'ô', 'w': 'ơ' },
//     'u': { 'w': 'ư' },
//     'd': { 'd': 'đ' },
//     'A': { 'a': 'Â', 'A': 'Â', 'w': 'Ă', 'W': 'Ă' },
//     'E': { 'e': 'Ê', 'E': 'Ê' },
//     'O': { 'o': 'Ô', 'O': 'Ô', 'w': 'Ơ', 'W': 'Ơ' },
//     'U': { 'w': 'Ư', 'W': 'Ư' },
//     'D': { 'd': 'Đ', 'D': 'Đ' }
//   };
  
//   // Bảng dấu thanh
//   const tones = {
//     's': ['á', 'ắ', 'ấ', 'é', 'ế', 'í', 'ó', 'ố', 'ớ', 'ú', 'ứ', 'ý',
//           'Á', 'Ắ', 'Ấ', 'É', 'Ế', 'Í', 'Ó', 'Ố', 'Ớ', 'Ú', 'Ứ', 'Ý'],
//     'f': ['à', 'ằ', 'ầ', 'è', 'ề', 'ì', 'ò', 'ồ', 'ờ', 'ù', 'ừ', 'ỳ',
//           'À', 'Ằ', 'Ầ', 'È', 'Ề', 'Ì', 'Ò', 'Ồ', 'Ờ', 'Ù', 'Ừ', 'Ỳ'],
//     'r': ['ả', 'ẳ', 'ẩ', 'ẻ', 'ể', 'ỉ', 'ỏ', 'ổ', 'ở', 'ủ', 'ử', 'ỷ',
//           'Ả', 'Ẳ', 'Ẩ', 'Ẻ', 'Ể', 'Ỉ', 'Ỏ', 'Ổ', 'Ở', 'Ủ', 'Ử', 'Ỷ'],
//     'x': ['ã', 'ẵ', 'ẫ', 'ẽ', 'ễ', 'ĩ', 'õ', 'ỗ', 'ỡ', 'ũ', 'ữ', 'ỹ',
//           'Ã', 'Ẵ', 'Ẫ', 'Ẽ', 'Ễ', 'Ĩ', 'Õ', 'Ỗ', 'Ỡ', 'Ũ', 'Ữ', 'Ỹ'],
//     'j': ['ạ', 'ặ', 'ậ', 'ẹ', 'ệ', 'ị', 'ọ', 'ộ', 'ợ', 'ụ', 'ự', 'ỵ',
//           'Ạ', 'Ặ', 'Ậ', 'Ẹ', 'Ệ', 'Ị', 'Ọ', 'Ộ', 'Ợ', 'Ụ', 'Ự', 'Ỵ']
//   };
  
//   const baseTones = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
//                      'A', 'Ă', 'Â', 'E', 'Ê', 'I', 'O', 'Ô', 'Ơ', 'U', 'Ư', 'Y'];
  
//   // Hàm loại bỏ dấu thanh để lấy nguyên âm
//   const removeTone = (char) => {
//     const allTonedVowels = 'áàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ';
//     const baseVowels =     'aaaaaăăăăăââââââeeeeeêêêêêiiiiiooooôôôôôôơơơơơuuuuưưưưưyyyyAAAAAAĂĂĂĂĂÂÂÂÂÂÂEEEEEÊÊÊÊÊIIIIIOOOOÔÔÔÔÔÔƠƠƠƠƠUUUUƯƯƯƯƯYYYYY';
    
//     const index = allTonedVowels.indexOf(char);
//     return index !== -1 ? baseVowels[index] : char;
//   };
  
//   // Hàm thêm dấu thanh
//   const addTone = (char, toneKey) => {
//     const baseChar = removeTone(char);
//     const baseIndex = baseTones.indexOf(baseChar);
    
//     if (baseIndex !== -1 && tones[toneKey]) {
//       return tones[toneKey][baseIndex];
//     }
//     return char;
//   };

//   // // Hàm xử lý logic Telex - Export để InputFormScreen có thể sử dụng
//   // const processVietnameseInput = (currentValue, key) => {
//   //   const newValue = currentValue + key;
//   //   const len = newValue.length;
    
//   //   // Kiểm tra chuyển đổi nguyên âm (aa -> â, aw -> ă, ...)
//   //   if (len >= 2) {
//   //     const lastChar = newValue[len - 1];
//   //     const secondLastChar = newValue[len - 2];
      
//   //     // Kiểm tra xem ký tự thứ 2 từ cuối có phải là nguyên âm có thể chuyển đổi
//   //     if (vowelTransforms[secondLastChar] && vowelTransforms[secondLastChar][lastChar]) {
//   //       const transformedChar = vowelTransforms[secondLastChar][lastChar];
//   //       return newValue.slice(0, -2) + transformedChar;
//   //     }
      
//   //     // Kiểm tra dấu thanh
//   //     const toneKey = lastChar.toLowerCase();
//   //     if (tones[toneKey]) {
//   //       const charToTone = newValue[len - 2];
//   //       const tonedChar = addTone(charToTone, toneKey);
        
//   //       if (tonedChar !== charToTone) {
//   //         return newValue.slice(0, -2) + tonedChar;
//   //       }
//   //     }
//   //   }
    
//   //   // Nếu không có chuyển đổi, trả về giá trị mới
//   //   return newValue;
//   // };
  
//   const keyboardLayout = [
//     [
//       { normal: '`', shift: '~' },
//       { normal: '1', shift: '!' },
//       { normal: '2', shift: '@' },
//       { normal: '3', shift: '#' },
//       { normal: '4', shift: '$' },
//       { normal: '5', shift: '%' },
//       { normal: '6', shift: '^' },
//       { normal: '7', shift: '&' },
//       { normal: '8', shift: '*' },
//       { normal: '9', shift: '(' },
//       { normal: '0', shift: ')' },
//       { normal: '-', shift: '_' },
//       { normal: '=', shift: '+' }
//     ],
//     [
//       'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
//       { normal: '[', shift: '{' },
//       { normal: ']', shift: '}' },
//       { normal: '\\', shift: '|' }
//     ],
//     [
//       'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
//       { normal: ';', shift: ':' },
//       { normal: "'", shift: '"' }
//     ],
//     [
//       'z', 'x', 'c', 'v', 'b', 'n', 'm',
//       { normal: ',', shift: '<' },
//       { normal: '.', shift: '>' },
//       { normal: '/', shift: '?' }
//     ]
//   ];

//   const handleKeyClick = (key) => {
//     let finalKey;
    
//     if (typeof key === 'object') {
//       finalKey = (isShift || isCapsLock) ? key.shift : key.normal;
//       onKeyPress(finalKey);
//     } else {
//       finalKey = (isCapsLock || isShift) ? key.toUpperCase() : key;
//       onKeyPress(finalKey);
//     }
    
//     if (isShift && !isCapsLock) {
//       setIsShift(false);
//     }
//   };
  
//   const getKeyDisplay = (key) => {
//     if (typeof key === 'object') {
//       return (isShift || isCapsLock) ? key.shift : key.normal;
//     }
//     return (isCapsLock || isShift) ? key.toUpperCase() : key;
//   };

//   const handleSpecialKey = (action) => {
//     switch(action) {
//       case 'backspace':
//         onKeyPress('Backspace');
//         break;
//       case 'space':
//         onKeyPress(' ');
//         break;
//       case 'enter':
//         onKeyPress('Enter');
//         break;
//       case 'shift':
//         setIsShift(!isShift);
//         break;
//       case 'caps':
//         setIsCapsLock(!isCapsLock);
//         setIsShift(false);
//         break;
//       default:
//         break;
//     }
//   };

//   const handleOverlayClick = (e) => {
//     if (e.target.classList.contains('virtual-keyboard-container')) {
//       onClose();
//     }
//   };

//   return (
//     <>
//       <style>{`
//         .virtual-keyboard-container {
//           position: fixed;
//           bottom: 0;
//           left: 0;
//           right: 0;
//           top: 0;
//           z-index: 9999;
//           pointer-events: none;
//           display: flex;
//           align-items: flex-end;
//         }
//         .virtual-keyboard {
//           pointer-events: all;
//           background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
//           border-radius: 12px 12px 0 0;
//           box-shadow: 0 -5px 30px rgba(0, 0, 0, 0.4);
//           padding: 0.667rem;
//           width: auto;
//           margin: 0 auto;
//           display: flex;
//           flex-direction: column;
//         }
//         .keyboard-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 0.167rem 0.333rem;
//           margin-bottom: 0.333rem;
//           border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//         }
//         .keyboard-title {
//           color: #e2e8f0;
//           font-weight: 600;
//           font-size: 0.583rem;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }
//         .keyboard-info {
//           background: rgba(34, 197, 94, 0.15);
//           border: 1px solid rgba(34, 197, 94, 0.3);
//           color: #86efac;
//           padding: 3px 8px;
//           border-radius: 4px;
//           font-size: 0.45rem;
//           font-weight: 500;
//         }
//         .keyboard-show {
//           color: white;
//           font-size: 12pt;
//           flex: 1;
//           text-align: center;
//           padding: 0 10px;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           font-weight: 500;
//           padding: 8px 12px;
//           min-height: 32px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           white-space: pre-line;
//         }
//         .keyboard-close {
//           background: rgba(239, 68, 68, 0.2);
//           border: none;
//           color: #fca5a5;
//           width: 30px;
//           height: 30px;
//           border-radius: 4px;
//           font-size: 0.833rem;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           line-height: 1;
//         }
//         .keyboard-close:hover {
//           background: rgba(239, 68, 68, 0.3);
//           color: #ef4444;
//         }
//         .keyboard-body {
//           padding: 0.167rem;
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           justify-content: space-between;
//         }
//         .keyboard-row {
//           display: flex;
//           gap: 0.2rem;
//           justify-content: center;
//         }
//         .key {
//           background: linear-gradient(135deg, #475569, #64748b);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           color: white;
//           padding: 0;
//           width: 48px;
//           height: 48px;
//           border-radius: 4px;
//           cursor: pointer;
//           transition: all 0.1s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 800;
//           font-size: 0.733rem;
//           user-select: none;
//           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
//         }
//         .key:hover {
//           background: linear-gradient(135deg, #64748b, #94a3b8);
//           transform: translateY(-1px);
//           box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
//         }
//         .key:active {
//           transform: translateY(0);
//           box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
//         }
//         .special-key {
//           background: linear-gradient(135deg, #2563eb, #3b82f6);
//           font-size: 0.533rem;
//         }
//         .special-key:hover {
//           background: linear-gradient(135deg, #3b82f6, #60a5fa);
//         }
//         .special-key.active {
//           background: linear-gradient(135deg, #10b981, #34d399);
//           box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
//         }
//         .tab-key {
//           min-width: 40px;
//         }
//         .caps-key {
//           min-width: 47px;
//         }
//         .shift-key {
//           min-width: 53px;
//         }
//         .backspace-key {
//           min-width: 53px;
//         }
//         .enter-key {
//           min-width: 60px;
//           background: linear-gradient(135deg, #10b981, #34d399);
//         }
//         .enter-key:hover {
//           background: linear-gradient(135deg, #34d399, #6ee7b7);
//         }
//         .space-key {
//           flex: 1;
//           min-width: 200px;
//         }
//         .ctrl-key, .alt-key {
//           min-width: 47px;
//         }

//         @media (max-width: 768px) {
//           .virtual-keyboard {
//             height: 40vh;
//             max-height: 280px;
//           }
//           .key {
//             min-width: 32px;
//             height: 38px;
//             font-size: 0.85rem;
//           }
//           .special-key {
//             font-size: 0.7rem;
//           }
//           .tab-key {
//             min-width: 45px;
//           }
//           .caps-key {
//             min-width: 50px;
//           }
//           .shift-key {
//             min-width: 55px;
//           }
//           .backspace-key, .enter-key {
//             min-width: 60px;
//           }
//           .space-key {
//             min-width: 180px;
//           }
//           .ctrl-key, .alt-key {
//             min-width: 50px;
//           }
//           .keyboard-row {
//             gap: 0.25rem;
//           }
//         }
//       `}</style>
      
//       <div className="virtual-keyboard-container" onClick={handleOverlayClick}>
//         <div className="virtual-keyboard" onClick={(e) => e.stopPropagation()}>
//           <div className="keyboard-header">
//             <span className="keyboard-title">
//               Bàn phím ảo
//               <span className="keyboard-info">Hỗ trợ Tiếng Việt (Telex)</span>
//             </span>
//             <span className="keyboard-show">{currentValue}</span>
//             <button className="keyboard-close" onClick={onClose}>×</button>
//           </div>
          
//           <div className="keyboard-body">
//             {keyboardLayout.map((row, rowIndex) => (
//               <div key={rowIndex} className="keyboard-row">
//                 {rowIndex === 0 && <div className="key special-key tab-key">Tab</div>}
//                 {rowIndex === 2 && (
//                   <div 
//                     className={`key special-key caps-key ${isCapsLock ? 'active' : ''}`}
//                     onClick={() => handleSpecialKey('caps')}
//                   >
//                     Caps
//                   </div>
//                 )}
//                 {rowIndex === 3 && (
//                   <div 
//                     className={`key special-key shift-key ${isShift ? 'active' : ''}`}
//                     onClick={() => handleSpecialKey('shift')}
//                   >
//                     ⇧
//                   </div>
//                 )}
                
//                 {row.map((key, keyIndex) => (
//                   <div
//                     key={keyIndex}
//                     className="key"
//                     onClick={() => handleKeyClick(key)}
//                   >
//                     {getKeyDisplay(key)}
//                   </div>
//                 ))}
                
//                 {rowIndex === 0 && (
//                   <div className="key special-key backspace-key" onClick={() => handleSpecialKey('backspace')}>
//                     ⌫
//                   </div>
//                 )}
//                 {rowIndex === 2 && (
//                   <div className="key special-key enter-key" onClick={() => handleSpecialKey('enter')}>
//                     Enter
//                   </div>
//                 )}
//                 {rowIndex === 3 && (
//                   <div 
//                     className={`key special-key shift-key ${isShift ? 'active' : ''}`}
//                     onClick={() => handleSpecialKey('shift')}
//                   >
//                     ⇧
//                   </div>
//                 )}
//               </div>
//             ))}
            
//             <div className="keyboard-row">
//               <div className="key special-key ctrl-key">Ctrl</div>
//               <div className="key special-key alt-key">Alt</div>
//               <div className="key space-key" onClick={() => handleSpecialKey('space')}>
//                 Space
//               </div>
//               <div className="key special-key alt-key">Alt</div>
//               <div className="key special-key ctrl-key">Ctrl</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// // Export các hàm utility để InputFormScreen có thể dùng
// export const processVietnameseInput = (currentValue, key) => {
//   const vowelTransforms = {
//     'a': { 'a': 'â', 'w': 'ă' },
//     'e': { 'e': 'ê' },
//     'o': { 'o': 'ô', 'w': 'ơ' },
//     'u': { 'w': 'ư' },
//     'd': { 'd': 'đ' },
//     'A': { 'a': 'Â', 'A': 'Â', 'w': 'Ă', 'W': 'Ă' },
//     'E': { 'e': 'Ê', 'E': 'Ê' },
//     'O': { 'o': 'Ô', 'O': 'Ô', 'w': 'Ơ', 'W': 'Ơ' },
//     'U': { 'w': 'Ư', 'W': 'Ư' },
//     'D': { 'd': 'Đ', 'D': 'Đ' }
//   };
  
//   const tones = {
//     's': ['á', 'ắ', 'ấ', 'é', 'ế', 'í', 'ó', 'ố', 'ớ', 'ú', 'ứ', 'ý',
//           'Á', 'Ắ', 'Ấ', 'É', 'Ế', 'Í', 'Ó', 'Ố', 'Ớ', 'Ú', 'Ứ', 'Ý'],
//     'f': ['à', 'ằ', 'ầ', 'è', 'ề', 'ì', 'ò', 'ồ', 'ờ', 'ù', 'ừ', 'ỳ',
//           'À', 'Ằ', 'Ầ', 'È', 'Ề', 'Ì', 'Ò', 'Ồ', 'Ờ', 'Ù', 'Ừ', 'Ỳ'],
//     'r': ['ả', 'ẳ', 'ẩ', 'ẻ', 'ể', 'ỉ', 'ỏ', 'ổ', 'ở', 'ủ', 'ử', 'ỷ',
//           'Ả', 'Ẳ', 'Ẩ', 'Ẻ', 'Ể', 'Ỉ', 'Ỏ', 'Ổ', 'Ở', 'Ủ', 'Ử', 'Ỷ'],
//     'x': ['ã', 'ẵ', 'ẫ', 'ẽ', 'ễ', 'ĩ', 'õ', 'ỗ', 'ỡ', 'ũ', 'ữ', 'ỹ',
//           'Ã', 'Ẵ', 'Ẫ', 'Ẽ', 'Ễ', 'Ĩ', 'Õ', 'Ỗ', 'Ỡ', 'Ũ', 'Ữ', 'Ỹ'],
//     'j': ['ạ', 'ặ', 'ậ', 'ẹ', 'ệ', 'ị', 'ọ', 'ộ', 'ợ', 'ụ', 'ự', 'ỵ',
//           'Ạ', 'Ặ', 'Ậ', 'Ẹ', 'Ệ', 'Ị', 'Ọ', 'Ộ', 'Ợ', 'Ụ', 'Ự', 'Ỵ']
//   };
  
//   const baseTones = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
//                      'A', 'Ă', 'Â', 'E', 'Ê', 'I', 'O', 'Ô', 'Ơ', 'U', 'Ư', 'Y'];
  
//   const removeTone = (char) => {
//     const allTonedVowels = 'áàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ';
//     const baseVowels =     'aaaaaăăăăăââââââeeeeeêêêêêiiiiiooooôôôôôôơơơơơuuuuưưưưưyyyyAAAAAAĂĂĂĂĂÂÂÂÂÂÂEEEEEÊÊÊÊÊIIIIIOOOOÔÔÔÔÔÔƠƠƠƠƠUUUUƯƯƯƯƯYYYYY';
    
//     const index = allTonedVowels.indexOf(char);
//     return index !== -1 ? baseVowels[index] : char;
//   };
  
//   const addTone = (char, toneKey) => {
//     const baseChar = removeTone(char);
//     const baseIndex = baseTones.indexOf(baseChar);
    
//     if (baseIndex !== -1 && tones[toneKey]) {
//       return tones[toneKey][baseIndex];
//     }
//     return char;
//   };

//   const newValue = currentValue + key;
//   const len = newValue.length;
  
//   if (len >= 2) {
//     const lastChar = newValue[len - 1];
//     const secondLastChar = newValue[len - 2];
    
//     if (vowelTransforms[secondLastChar] && vowelTransforms[secondLastChar][lastChar]) {
//       const transformedChar = vowelTransforms[secondLastChar][lastChar];
//       return newValue.slice(0, -2) + transformedChar;
//     }
    
//     const toneKey = lastChar.toLowerCase();
//     if (tones[toneKey]) {
//       const charToTone = newValue[len - 2];
//       const tonedChar = addTone(charToTone, toneKey);
      
//       if (tonedChar !== charToTone) {
//         return newValue.slice(0, -2) + tonedChar;
//       }
//     }
//   }
  
//   return newValue;
// };

// export default VirtualKeyboard;

import React, { useState, useRef, useEffect } from "react";

const VirtualKeyboard = ({ onKeyPress, onClose, currentValue = "" }) => {
  const [isShift, setIsShift] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const keyboardRef = useRef(null);
  
  // Bảng chuyển đổi ký tự có dấu mũ/móc
  const vowelTransforms = {
    'a': { 'a': 'â', 'w': 'ă' },
    'e': { 'e': 'ê' },
    'o': { 'o': 'ô', 'w': 'ơ' },
    'u': { 'w': 'ư' },
    'd': { 'd': 'đ' },
    'A': { 'a': 'Â', 'A': 'Â', 'w': 'Ă', 'W': 'Ă' },
    'E': { 'e': 'Ê', 'E': 'Ê' },
    'O': { 'o': 'Ô', 'O': 'Ô', 'w': 'Ơ', 'W': 'Ơ' },
    'U': { 'w': 'Ư', 'W': 'Ư' },
    'D': { 'd': 'Đ', 'D': 'Đ' }
  };
  
  // Bảng dấu thanh
  const tones = {
    's': ['á', 'ắ', 'ấ', 'é', 'ế', 'í', 'ó', 'ố', 'ớ', 'ú', 'ứ', 'ý',
          'Á', 'Ắ', 'Ấ', 'É', 'Ế', 'Í', 'Ó', 'Ố', 'Ớ', 'Ú', 'Ứ', 'Ý'],
    'f': ['à', 'ằ', 'ầ', 'è', 'ề', 'ì', 'ò', 'ồ', 'ờ', 'ù', 'ừ', 'ỳ',
          'À', 'Ằ', 'Ầ', 'È', 'Ề', 'Ì', 'Ò', 'Ồ', 'Ờ', 'Ù', 'Ừ', 'Ỳ'],
    'r': ['ả', 'ẳ', 'ẩ', 'ẻ', 'ể', 'ỉ', 'ỏ', 'ổ', 'ở', 'ủ', 'ử', 'ỷ',
          'Ả', 'Ẳ', 'Ẩ', 'Ẻ', 'Ể', 'Ỉ', 'Ỏ', 'Ổ', 'Ở', 'Ủ', 'Ử', 'Ỷ'],
    'x': ['ã', 'ẵ', 'ẫ', 'ẽ', 'ễ', 'ĩ', 'õ', 'ỗ', 'ỡ', 'ũ', 'ữ', 'ỹ',
          'Ã', 'Ẵ', 'Ẫ', 'Ẽ', 'Ễ', 'Ĩ', 'Õ', 'Ỗ', 'Ỡ', 'Ũ', 'Ữ', 'Ỹ'],
    'j': ['ạ', 'ặ', 'ậ', 'ẹ', 'ệ', 'ị', 'ọ', 'ộ', 'ợ', 'ụ', 'ự', 'ỵ',
          'Ạ', 'Ặ', 'Ậ', 'Ẹ', 'Ệ', 'Ị', 'Ọ', 'Ộ', 'Ợ', 'Ụ', 'Ự', 'Ỵ']
  };
  
  const baseTones = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
                     'A', 'Ă', 'Â', 'E', 'Ê', 'I', 'O', 'Ô', 'Ơ', 'U', 'Ư', 'Y'];
  
  // Hàm loại bỏ dấu thanh để lấy nguyên âm
  const removeTone = (char) => {
    const allTonedVowels = 'áàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ';
    const baseVowels =     'aaaaaăăăăăââââââeeeeeêêêêêiiiiiooooôôôôôôơơơơơuuuuưưưưưyyyyAAAAAAĂĂĂĂĂÂÂÂÂÂÂEEEEEÊÊÊÊÊIIIIIOOOOÔÔÔÔÔÔƠƠƠƠƠUUUUƯƯƯƯƯYYYYY';
    
    const index = allTonedVowels.indexOf(char);
    return index !== -1 ? baseVowels[index] : char;
  };
  
  // Hàm thêm dấu thanh
  const addTone = (char, toneKey) => {
    const baseChar = removeTone(char);
    const baseIndex = baseTones.indexOf(baseChar);
    
    if (baseIndex !== -1 && tones[toneKey]) {
      return tones[toneKey][baseIndex];
    }
    return char;
  };
  
  const keyboardLayout = [
    [
      { normal: '`', shift: '~' },
      { normal: '1', shift: '!' },
      { normal: '2', shift: '@' },
      { normal: '3', shift: '#' },
      { normal: '4', shift: '$' },
      { normal: '5', shift: '%' },
      { normal: '6', shift: '^' },
      { normal: '7', shift: '&' },
      { normal: '8', shift: '*' },
      { normal: '9', shift: '(' },
      { normal: '0', shift: ')' },
      { normal: '-', shift: '_' },
      { normal: '=', shift: '+' }
    ],
    [
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      { normal: '[', shift: '{' },
      { normal: ']', shift: '}' },
      { normal: '\\', shift: '|' }
    ],
    [
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      { normal: ';', shift: ':' },
      { normal: "'", shift: '"' }
    ],
    [
      'z', 'x', 'c', 'v', 'b', 'n', 'm',
      { normal: ',', shift: '<' },
      { normal: '.', shift: '>' },
      { normal: '/', shift: '?' }
    ]
  ];

  // Xử lý bắt đầu kéo (chuột)
  const handleMouseDown = (e) => {
    // Chỉ kéo khi nhấn vào header
    if (e.target.closest('.keyboard-header') && !e.target.closest('.keyboard-close')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Xử lý bắt đầu kéo (cảm ứng)
  const handleTouchStart = (e) => {
    if (e.target.closest('.keyboard-header') && !e.target.closest('.keyboard-close')) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  // Xử lý di chuyển (chuột)
  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Giới hạn trong viewport
      const maxX = window.innerWidth - (keyboardRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (keyboardRef.current?.offsetHeight || 0);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  // Xử lý di chuyển (cảm ứng)
  const handleTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      
      const maxX = window.innerWidth - (keyboardRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (keyboardRef.current?.offsetHeight || 0);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  // Xử lý kết thúc kéo
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Thêm event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, dragStart, position]);

  // Căn giữa bàn phím khi mount
  useEffect(() => {
    if (keyboardRef.current) {
      const keyboardWidth = keyboardRef.current.offsetWidth;
      const keyboardHeight = keyboardRef.current.offsetHeight;
      setPosition({
        x: (window.innerWidth - keyboardWidth) / 2,
        y: window.innerHeight - keyboardHeight - 20
      });
    }
  }, []);

  const handleKeyClick = (key) => {
    let finalKey;
    
    if (typeof key === 'object') {
      finalKey = (isShift || isCapsLock) ? key.shift : key.normal;
      onKeyPress(finalKey);
    } else {
      finalKey = (isCapsLock || isShift) ? key.toUpperCase() : key;
      onKeyPress(finalKey);
    }
    
    if (isShift && !isCapsLock) {
      setIsShift(false);
    }
  };
  
  const getKeyDisplay = (key) => {
    if (typeof key === 'object') {
      return (isShift || isCapsLock) ? key.shift : key.normal;
    }
    return (isCapsLock || isShift) ? key.toUpperCase() : key;
  };

  const handleSpecialKey = (action) => {
    switch(action) {
      case 'backspace':
        onKeyPress('Backspace');
        break;
      case 'space':
        onKeyPress(' ');
        break;
      case 'enter':
        // Thay đổi: Gửi ký tự xuống dòng thay vì đóng bàn phím
        onKeyPress('\n');
        break;
      case 'shift':
        setIsShift(!isShift);
        break;
      case 'caps':
        setIsCapsLock(!isCapsLock);
        setIsShift(false);
        break;
      default:
        break;
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('virtual-keyboard-container')) {
      onClose();
    }
  };

  return (
    <>
      <style>{`
        .virtual-keyboard-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          top: 0;
          z-index: 9999;
          pointer-events: none;
        }
        .virtual-keyboard {
          pointer-events: all;
          position: fixed;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-radius: 12px;
          box-shadow: 0 -5px 30px rgba(0, 0, 0, 0.4);
          padding: 0.667rem;
          width: auto;
          display: flex;
          flex-direction: column;
          transition: ${isDragging ? 'none' : 'all 0.2s ease'};
        }
        .keyboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.667rem;
          margin-bottom: 0.333rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: ${isDragging ? 'grabbing' : 'grab'};
          user-select: none;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin: -0.333rem -0.333rem 0.333rem -0.333rem;
          padding: 0.667rem;
        }
        .keyboard-header:active {
          cursor: grabbing;
        }
        .keyboard-title {
          color: #e2e8f0;
          font-weight: 600;
          font-size: 0.5 rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .keyboard-info {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.45rem;
          font-weight: 500;
        }
        .keyboard-show {
          color: white;
          font-size: 12pt;
          flex: 1;
          // text-align: center;
          font-weight: 500;
          padding: 8px 12px;
          min-height: 32px;
          height: 64px;
          max-width: 540px;
          overflow-y: auto;
          overflow-x: hidden;
          word-wrap: break-word;
          word-break: break-word;
          white-space: pre-wrap;
          display: block;
        }
        .keyboard-show::-webkit-scrollbar {
          width: 6px;
        }
        .keyboard-show::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .keyboard-show::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .keyboard-show::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .keyboard-close {
          background: rgba(239, 68, 68, 0.2);
          border: none;
          color: #fca5a5;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          font-size: 0.833rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .keyboard-close:hover {
          background: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
        .keyboard-body {
          padding: 0.167rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .keyboard-row {
          display: flex;
          gap: 0.2rem;
          margin: 0.1rem 0;
          justify-content: center;
        }
        .key {
          background: linear-gradient(135deg, #475569, #64748b);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0;
          width: 54px;
          height: 54px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          user-select: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .key:hover {
          background: linear-gradient(135deg, #64748b, #94a3b8);
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        }
        .key:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .keys {
          background: linear-gradient(135deg, #475569, #64748b);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          height: 54px;
          user-select: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .keys:hover {
          background: linear-gradient(135deg, #64748b, #94a3b8);
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        }
        .keys:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .special-key {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          font-size: 0.795rem;
        }
        .special-key:hover {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
        }
        .special-key.active {
          background: linear-gradient(135deg, #10b981, #34d399);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
        }
        .tab-key {
          min-width: 54px;
        }
        .none-key {
          min-width: 54px;
        }
        .caps-key {
          min-width: 110px;
        }
        .shift-key {
          min-width: 140px;
        }
        .backspace-key {
          min-width: 53px;
        }
        .enter-key {
          width: 110px;
          background: linear-gradient(135deg, #10b981, #34d399);
        }
        .enter-key:hover {
          background: linear-gradient(135deg, #34d399, #6ee7b7);
        }
        .space-key {
          flex: 1;
          min-width: 200px;
        }
        .ctrl-key, .alt-key {
          min-width: 54px;
        }

        @media (max-width: 768px) {
          .virtual-keyboard {
            max-height: 90vh;
          }
          .key {
            min-width: 32px;
            height: 38px;
            font-size: 0.85rem;
          }
          .special-key {
            font-size: 0.7rem;
          }
          .tab-key {
            min-width: 45px;
          }
          .caps-key {
            min-width: 50px;
          }
          .none-key {
            min-width: 50px;
          }
          .shift-key {
            min-width: 55px;
          }
          .backspace-key, .enter-key {
            min-width: 60px;
          }
          .space-key {
            min-width: 180px;
          }
          .ctrl-key, .alt-key {
            min-width: 50px;
          }
          .keyboard-row {
            gap: 0.25rem;
          }
        }
      `}</style>
      
      <div className="virtual-keyboard-container" onClick={handleOverlayClick}>
        <div 
          ref={keyboardRef}
          className="virtual-keyboard" 
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="keyboard-header"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <span className="keyboard-title">
              🎹 Keyboard
              {/* <span className="keyboard-info">Telex - Kéo để di chuyển</span> */}
            </span>
            <span className="keyboard-show">{currentValue}</span>
            <button className="keyboard-close" onClick={onClose}>×</button>
          </div>
          
          <div className="keyboard-body">
            {keyboardLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="keyboard-row">
                {rowIndex === 0 && <div className="keys special-key none-key">Esc</div>}
                {rowIndex === 1 && <div className="keys special-key tab-key">Tab</div>}
                {rowIndex === 2 && (
                  <div 
                    className={`keys special-key caps-key ${isCapsLock ? 'active' : ''}`}
                    onClick={() => handleSpecialKey('caps')}
                  >
                    Caps
                  </div>
                )}
                {rowIndex === 3 && (
                  <div 
                    className={`keys special-key shift-key ${isShift ? 'active' : ''}`}
                    onClick={() => handleSpecialKey('shift')}
                  >
                    ⇧ Shift
                  </div>
                )}
                
                {row.map((key, keyIndex) => (
                  <div
                    key={keyIndex}
                    className="key"
                    onClick={() => handleKeyClick(key)}
                  >
                    {getKeyDisplay(key)}
                  </div>
                ))}
                
                {rowIndex === 0 && (
                  <div className="keys special-key backspace-key" onClick={() => handleSpecialKey('backspace')}>
                    ⌫
                  </div>
                )}
                {rowIndex === 1 && <div className="keys special-key tab-key">Tab</div>}
                {rowIndex === 2 && (
                  <div className="keys special-key enter-key" onClick={() => handleSpecialKey('enter')}>
                    ↵ Enter
                  </div>
                )}
                {rowIndex === 3 && (
                  <div 
                    className={`keys special-key shift-key ${isShift ? 'active' : ''}`}
                    onClick={() => handleSpecialKey('shift')}
                  >
                    ⇧ Shift
                  </div>
                )}
              </div>
            ))}
            
            <div className="keyboard-row">
              <div className="keys special-key ctrl-key">Ctrl</div>
              <div className="keys special-key alt-key">Alt</div>
              <div className="keys space-key" onClick={() => handleSpecialKey('space')}>
                Space
              </div>
              <div className="keys special-key alt-key">Alt</div>
              <div className="keys special-key ctrl-key">Ctrl</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Export các hàm utility để InputFormScreen có thể dùng
export const processVietnameseInput = (currentValue, key) => {
  const vowelTransforms = {
    'a': { 'a': 'â', 'w': 'ă' },
    'e': { 'e': 'ê' },
    'o': { 'o': 'ô', 'w': 'ơ' },
    'u': { 'w': 'ư' },
    'd': { 'd': 'đ' },
    'A': { 'a': 'Â', 'A': 'Â', 'w': 'Ă', 'W': 'Ă' },
    'E': { 'e': 'Ê', 'E': 'Ê' },
    'O': { 'o': 'Ô', 'O': 'Ô', 'w': 'Ơ', 'W': 'Ơ' },
    'U': { 'w': 'Ư', 'W': 'Ư' },
    'D': { 'd': 'Đ', 'D': 'Đ' }
  };
  
  const tones = {
    's': ['á', 'ắ', 'ấ', 'é', 'ế', 'í', 'ó', 'ố', 'ớ', 'ú', 'ứ', 'ý',
          'Á', 'Ắ', 'Ấ', 'É', 'Ế', 'Í', 'Ó', 'Ố', 'Ớ', 'Ú', 'Ứ', 'Ý'],
    'f': ['à', 'ằ', 'ầ', 'è', 'ề', 'ì', 'ò', 'ồ', 'ờ', 'ù', 'ừ', 'ỳ',
          'À', 'Ằ', 'Ầ', 'È', 'Ề', 'Ì', 'Ò', 'Ồ', 'Ờ', 'Ù', 'Ừ', 'Ỳ'],
    'r': ['ả', 'ẳ', 'ẩ', 'ẻ', 'ể', 'ỉ', 'ỏ', 'ổ', 'ở', 'ủ', 'ử', 'ỷ',
          'Ả', 'Ẳ', 'Ẩ', 'Ẻ', 'Ể', 'Ỉ', 'Ỏ', 'Ổ', 'Ở', 'Ủ', 'Ử', 'Ỷ'],
    'x': ['ã', 'ẵ', 'ẫ', 'ẽ', 'ễ', 'ĩ', 'õ', 'ỗ', 'ỡ', 'ũ', 'ữ', 'ỹ',
          'Ã', 'Ẵ', 'Ẫ', 'Ẽ', 'Ễ', 'Ĩ', 'Õ', 'Ỗ', 'Ỡ', 'Ũ', 'Ữ', 'Ỹ'],
    'j': ['ạ', 'ặ', 'ậ', 'ẹ', 'ệ', 'ị', 'ọ', 'ộ', 'ợ', 'ụ', 'ự', 'ỵ',
          'Ạ', 'Ặ', 'Ậ', 'Ẹ', 'Ệ', 'Ị', 'Ọ', 'Ộ', 'Ợ', 'Ụ', 'Ự', 'Ỵ']
  };
  
  const baseTones = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
                     'A', 'Ă', 'Â', 'E', 'Ê', 'I', 'O', 'Ô', 'Ơ', 'U', 'Ư', 'Y'];
  
  const removeTone = (char) => {
    const allTonedVowels = 'áàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ';
    const baseVowels =     'aaaaaăăăăăââââââeeeeeêêêêêiiiiiooooôôôôôôơơơơơuuuuưưưưưyyyyAAAAAAĂĂĂĂĂÂÂÂÂÂÂEEEEEÊÊÊÊÊIIIIIOOOOÔÔÔÔÔÔƠƠƠƠƠUUUUƯƯƯƯƯYYYYY';
    
    const index = allTonedVowels.indexOf(char);
    return index !== -1 ? baseVowels[index] : char;
  };
  
  const addTone = (char, toneKey) => {
    const baseChar = removeTone(char);
    const baseIndex = baseTones.indexOf(baseChar);
    
    if (baseIndex !== -1 && tones[toneKey]) {
      return tones[toneKey][baseIndex];
    }
    return char;
  };

  const newValue = currentValue + key;
  const len = newValue.length;
  
  if (len >= 2) {
    const lastChar = newValue[len - 1];
    const secondLastChar = newValue[len - 2];
    
    if (vowelTransforms[secondLastChar] && vowelTransforms[secondLastChar][lastChar]) {
      const transformedChar = vowelTransforms[secondLastChar][lastChar];
      return newValue.slice(0, -2) + transformedChar;
    }
    
    const toneKey = lastChar.toLowerCase();
    if (tones[toneKey]) {
      const charToTone = newValue[len - 2];
      const tonedChar = addTone(charToTone, toneKey);
      
      if (tonedChar !== charToTone) {
        return newValue.slice(0, -2) + tonedChar;
      }
    }
  }
  
  return newValue;
};

export default VirtualKeyboard;