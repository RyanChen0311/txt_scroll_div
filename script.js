document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const wordsPerSectionInput = document.getElementById('wordsPerSection');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const jumpButton = document.getElementById('jumpButton');
    const jumpToPageInput = document.getElementById('jumpToPage');
    const windowInfo = document.getElementById('windowInfo');
    const wordCountInfo = document.getElementById('wordCountInfo');
    const fileName = document.getElementById('fileName');
    const successMessage = document.querySelector('.success-message');
    let currentPage = 0;
    let pages = [];
    let originalText = '';
    let isScrolling = false;

    // 處理滾動事件
    function handleScroll(event) {
        const content = document.querySelector('.window-content');
        if (!content) return;
        
        const isAtTop = content.scrollTop === 0;
        const isAtBottom = Math.abs(content.scrollHeight - content.scrollTop - content.clientHeight) < 1;
        
        if (event.deltaY > 0 && isAtBottom) {
            // 向下滾動且到達底部
            if (currentPage < pages.length - 1) {
                currentPage++;
                updateDisplay();
            }
        } else if (event.deltaY < 0 && isAtTop) {
            // 向上滾動且到達頂部
            if (currentPage > 0) {
                currentPage--;
                updateDisplay();
            }
        }
    }

    // 添加滾動事件監聽器
    document.addEventListener('wheel', handleScroll);

    // 更新頁面選擇器
    function updatePageSelect() {
        if (!jumpToPageInput) return;
        
        // 清空選擇器
        jumpToPageInput.innerHTML = '';
        
        // 添加選項
        for (let i = 1; i <= pages.length; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `第 ${i} 頁`;
            jumpToPageInput.appendChild(option);
        }
        
        // 設置當前頁面
        jumpToPageInput.value = currentPage + 1;
    }

    // 跳轉到指定頁面
    function jumpToPage() {
        const pageNum = parseInt(jumpToPageInput.value);
        if (pageNum && pageNum >= 1 && pageNum <= pages.length) {
            currentPage = pageNum - 1;
            updateDisplay();
        }
    }

    // 監聽跳轉按鈕點擊
    jumpButton.addEventListener('click', jumpToPage);

    // 監聽輸入框 Enter 鍵
    jumpToPageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            jumpToPage();
        }
    });

    // 顯示成功訊息
    function showSuccessMessage(message) {
        successMessage.textContent = message;
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 1000);
    }

    // 監聽文件上傳
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = function(e) {
                originalText = e.target.result;
                createPages();
                showSuccessMessage(`${file.name} 讀取成功`);
            };
            reader.readAsText(file, 'UTF-8');
        }
    });

    // 監聽字數調整
    wordsPerSectionInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value < 100) {
            this.value = 100;
            alert('每頁最少需要100字！');
        }
        if (originalText) {
            createPages();
        }
    });

    // 監聽上一頁按鈕
    prevPageButton.addEventListener('click', function() {
        if (currentPage > 0) {
            currentPage--;
            updateDisplay();
        }
    });

    // 監聽下一頁按鈕
    nextPageButton.addEventListener('click', function() {
        if (currentPage < pages.length - 1) {
            currentPage++;
            updateDisplay();
        }
    });

    // 計算字數（使用類似 Word 的計算方式）
    function countWords(text) {
        // 移除所有標點符號和特殊字符
        const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
        
        // 計算中文字數
        const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
        
        // 計算英文單字數（連續的英文字母算一個單字）
        const englishWords = (cleanText.match(/\b[a-zA-Z]+\b/g) || []).length;
        
        // 計算數字（連續的數字算一個）
        const numbers = (cleanText.match(/\b\d+\b/g) || []).length;
        
        return chineseChars + englishWords + numbers;
    }

    // 將文字分割成句子
    function splitIntoSentences(text) {
        // 處理段落
        const paragraphs = text.split(/\n\s*\n/);
        
        // 處理每個段落
        return paragraphs.map(paragraph => {
            // 移除開頭的空白
            paragraph = paragraph.trim();
            
            // 如果段落為空，返回空字串
            if (!paragraph) return '';
            
            // 處理英文和中文的標點符號
            const sentences = paragraph.split(/(?<=[.!?。！？])\s*/);
            
            // 過濾空句子並確保每個句子都有適當的標點符號
            return sentences
                .filter(sentence => sentence.trim())
                .map(sentence => {
                    sentence = sentence.trim();
                    // 如果句子結尾沒有標點符號，添加句號
                    if (!/[.!?。！？]$/.test(sentence)) {
                        sentence += '.';
                    }
                    return sentence;
                })
                .join(' ');
        }).filter(p => p); // 過濾空段落
    }

    // 創建頁面
    function createPages() {
        if (!originalText) return;
        
        const wordsPerSection = parseInt(wordsPerSectionInput.value) || 500;
        const sentences = splitIntoSentences(originalText);
        pages = [];
        let currentPage = [];
        let currentWordCount = 0;
        
        // 計算總字數
        const totalWords = countWords(originalText);
        
        // 計算預期頁數
        const expectedPages = Math.ceil(totalWords / wordsPerSection);
        
        // 先嘗試按段落分頁
        let currentParagraph = [];
        let paragraphWordCount = 0;
        
        for (const sentence of sentences) {
            // 計算當前句子的字數
            const sentenceWordCount = countWords(sentence);
            
            // 如果當前段落加上新句子會超過限制，且當前段落不為空
            if (paragraphWordCount + sentenceWordCount > wordsPerSection && currentParagraph.length > 0) {
                // 將當前段落加入頁面
                currentPage.push(currentParagraph.join(' '));
                currentWordCount += paragraphWordCount;
                
                // 如果當前頁面已滿，創建新頁面
                if (currentWordCount >= wordsPerSection) {
                    pages.push(currentPage.join('\n\n'));
                    currentPage = [];
                    currentWordCount = 0;
                }
                
                // 重置段落
                currentParagraph = [];
                paragraphWordCount = 0;
            }
            
            // 添加句子到當前段落
            currentParagraph.push(sentence);
            paragraphWordCount += sentenceWordCount;
        }
        
        // 處理最後一個段落
        if (currentParagraph.length > 0) {
            currentPage.push(currentParagraph.join(' '));
            currentWordCount += paragraphWordCount;
        }
        
        // 處理最後一頁
        if (currentPage.length > 0) {
            pages.push(currentPage.join('\n\n'));
        }
        
        // 如果頁數不足，按固定字數重新分頁
        if (pages.length < expectedPages) {
            pages = [];
            currentPage = [];
            currentWordCount = 0;
            
            for (const sentence of sentences) {
                const sentenceWordCount = countWords(sentence);
                
                if (currentWordCount + sentenceWordCount > wordsPerSection && currentPage.length > 0) {
                    pages.push(currentPage.join(' '));
                    currentPage = [];
                    currentWordCount = 0;
                }
                
                currentPage.push(sentence);
                currentWordCount += sentenceWordCount;
            }
            
            if (currentPage.length > 0) {
                pages.push(currentPage.join(' '));
            }
        }
        
        // 更新頁面選擇器
        updatePageSelect();
        
        // 顯示第一頁
        currentPage = 0;
        updateDisplay();
    }

    // 更新顯示
    function updateDisplay() {
        if (pages.length === 0) {
            windowInfo.textContent = '第 0 頁 / 共 0 頁';
            wordCountInfo.textContent = '當前字數：0';
            return;
        }

        // 更新頁面信息
        windowInfo.textContent = `第 ${currentPage + 1} 頁 / 共 ${pages.length} 頁`;
        wordCountInfo.textContent = `當前字數：${pages[currentPage].length}`;

        // 更新頁面選擇器
        updatePageSelect();

        // 更新按鈕狀態
        prevPageButton.disabled = currentPage === 0;
        nextPageButton.disabled = currentPage === pages.length - 1;

        // 更新內容顯示
        const content = document.querySelector('.window-content');
        content.textContent = pages[currentPage];
        
        // 重置滾動位置
        content.scrollTop = 0;
    }
}); 