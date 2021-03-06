const redirectDst = chrome.extension.getURL("html/alert.html");

function redirect(requestDetails){
    var u = redirectDst + '?to=' + requestDetails.url;
    return {redirectUrl: u};
}
function redirectHandler(requestDetails){
    // Gmailでリンクをクリックして遷移した場合
    if (requestDetails.originUrl.split('/')[2] == 'mail.google.com') {
        browser.webRequest.onBeforeRequest.addListener(
            // callback: このイベントが発生したときに呼び出される関数
            htmlFilter,
            // filter: このリスナーに送信されるイベントを制限するフィルタ
            { urls:['*://*/*'], types:['main_frame'] },
            // blocking: リクエストを同期化してリクエストをキャンセルまたはリダイレクトできるようにする
            ['blocking']
        );
    } else {
        // Gmail以外からだった時の処理(テスト用)
        console.log(requestDetails.url.split('/')[2]);
    }
}

function htmlFilter(requestDetails){
    let filter = browser.webRequest.filterResponseData(requestDetails.requestId);
    let decoder = new TextDecoder('utf-8');
    let data = [];

    filter.ondata = event => {    // データを受け取ったら(パケットに小分けされて何回も受け取る)
        data.push(event.data);    // データをスタックに積む
        filter.write(event.data); // データをブラウザにわたす
    }

    filter.onstop = event => {    // データをすべて受け取り終わったら
        // スタックに積んだデータを文字列にデコード
        let str = '';
        for (let buffer of data) { str += decoder.decode(buffer, {stream: true}) }
        str += decoder.decode();  // end-of-stream

        // 空白, 改行を削除
        str = str.replace(/(\s+|\r\n|\n|\r)/gm,'');
        // headタグを抽出
        let head = str.match(/<head>.*<\/head>/);
        // headタグがあれば次の処理に遷移
        if (head != null) {
            head = head[0];

            // ここにフィルタ処理を追加する
            const blackcollection = ["外貨預金","投資信託","採用情報","住宅ローン","かりる","教育ローン","そなえる","よくあるご質問","ためる・ふやす","定期預金","サイトマップ","個人のお客さま","ニュースリリース","貸金庫","リフォームローン","お知らせ","店舗・ATM","カードローン","フリーローン","マイカーローン","電子公告","口座開設","資料請求","法人のお客さま","手数料一覧","保険募集指針","円預金","利益相反管理方針","終身保険","個人年金保険","お問い合わせ","会社概要","店舗・ATMのご案内","保険商品","確定拠出年金","勧誘方針","English","資金調達","経営方針","総合口座","クレジットカード","会社情報","ログイン","便利なサービス","便利に使う","その他のサービス","株主総会","口座をひらく","各種手数料","損害保険","トップメッセージ","外貨両替","IRカレンダー","火災保険","ローン","個人情報保護宣言","各種お手続き","預金保険制度について","普通預金","規定一覧","各種サービス","株主・投資家の皆さま","決算短信","便利につかう","貯蓄預金","公共債","生命保険","外国送金","デビットカード","セキュリティ","手数料","お問合せ","金利一覧","金利情報","キャンペーン一覧","金融商品勧誘方針","プライバシーポリシー","役員一覧","ニュースリリース一覧","ディスクロージャー誌","リンク集","IRニュース","預金金利","採用のご案内","個人投資家の皆さまへ","経営理念","自動送金サービス","新着情報","財務ハイライト","スマホ決済サービス","国債","資産運用","セカンドライフ","スピード王MAX","ホーム","中期経営計画","ご意見・ご要望","ATM","ディスクロージャー","学資保険"
	   ];
	    var counter = 0;	//サイトヘッダーとキーワードの一致数カウント    
	    for(let i = 0;i <blackcollection.length; i++){
	        if(head.match(blackcollection[i])){
		    counter += 1;
		}
	    }
	    console.log("The number of keywords in the header is..." + counter);
	    console.log(head);

        }
        filter.close();           // フィルタオブジェクトを終了する
    }

    // 証明書の取得
    browser.webRequest.onHeadersReceived.addListener(
        async function(requestDetails){
            try {
                let securityInfo = await browser.webRequest.getSecurityInfo(requestDetails.requestId, {})
                console.log(securityInfo)
            }
            catch(error){ console.error(error) }
        },
        { urls:['*://*/*'], types:['main_frame'] }
    );
}

browser.webRequest.onBeforeRedirect.addListener(
  redirectHandler,
  { urls: ['https://www.google.com/url?*'] }
);
