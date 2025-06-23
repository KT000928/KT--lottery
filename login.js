
async function login() {
  const account = document.getElementById("account").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = "";

  const token = "patumsIGII0pfiEUy.fb7134795a0fdb9a5186870eeb4c7fee706a574c911a1183fafd310021cad0fe";
  const baseId = "appURiDPwrJuZFLFO";
  const userTable = "KT";
  const logTable = "login_logs";

  const ipRes = await fetch("https://api.ipify.org?format=json");
  const ipData = await ipRes.json();
  const userIP = ipData.ip;

  const url = `https://api.airtable.com/v0/${baseId}/${userTable}?filterByFormula=AND({account}='${account}')`;

  let result = "";
  let success = false;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.records.length === 0) {
      result = "帳號錯誤";
      errorMsg.textContent = result;
    } else {
      const user = data.records[0].fields;
      if (user.password !== password) {
        result = "密碼錯誤";
        errorMsg.textContent = result;
      } else if (user.status !== "啟用") {
        result = "帳號尚未啟用";
        errorMsg.textContent = result;
      } else {
        result = "登入成功";
        success = true;
        sessionStorage.setItem("kt_logged_in", "1");
        alert("登入成功，正在跳轉...");
        window.location.href = window.location.origin + window.location.pathname.replace("login.html", "index.html");
      }
    }
  } catch (err) {
    console.error(err);
    result = "登入錯誤";
    errorMsg.textContent = result;
  }

  // 寫入 Airtable login_logs 紀錄
  const logPayload = {
    records: [
      {
        fields: {
          account: account,
          result: result,
          time: new Date().toISOString(),
          ip: userIP,
          note: ""
        }
      }
    ]
  };

  await fetch(`https://api.airtable.com/v0/${baseId}/${logTable}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(logPayload)
  });
}
