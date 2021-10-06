async function getUser() { // 로딩 시 사용자 가져오는 함수
  try {
    console.log('777');
    const res = await axios.get('/users');
    const users = res.data;
    console.log('hi' + users);
    const list = document.getElementById('list');
    list.innerHTML = '';
    console.log('aaa');
    // 사용자마다 반복적으로 화면 표시 및 이벤트 연결
    Object.keys(users).map(function (key) {
      const userDiv = document.createElement('div');
      const span = document.createElement('span');
      span.textContent = `${key} : ${users[key]}`;
      const edit = document.createElement('button');
      edit.textContent = '전송';
      edit.addEventListener('click', async () => { // 수정 버튼 클릭
        try {
          await axios.post('/transaction', users );
          console.log('성공');
        } catch (err) {
          console.error(err);
        }
      });
      const remove = document.createElement('button');
      remove.textContent = '삭제';
      remove.addEventListener('click', async () => { // 삭제 버튼 클릭
        try {
          await axios.delete('/user/' + key);
          getUser();
        } catch (err) {
          console.error(err);
        }
      });
      userDiv.appendChild(span);
      userDiv.appendChild(edit);
      userDiv.appendChild(remove);
      list.appendChild(userDiv);
    });
  } catch (err) {
    console.error(err);
  }
}

window.onload = getUser; // 화면 로딩 시 getUser 호출
// 폼 제출(submit) 시 실행
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = e.target.password.value;
  try {
    const res = await axios.post('/mnemonic', {password});
    const data = res.data;
    console.log('bb');
    mnemonic(data);
  } catch (err) {
    console.error(err);
  }
  e.target.username.value = '';
});

async function mnemonic (data) {
  try {
      const mnemonic = data;
      const view = document.getElementById('mnemonic');
      view.innerHTML = '';
      const div = document.createElement('div');
      const span = document.createElement('span');
      const form = document.createElement('form');
      const button = document.createElement('button');
      span.textContent = mnemonic;
      console.log("dd"+mnemonic);
      button.textContent = '니모닉으로 지갑 생성';
      button.addEventListener('click', async (e) => {
          try {
              await axios.post('/user', {mnemonic});
              getUser();
          } catch (err) {
              console.error(err);
          }
      } )
      div.appendChild(span);
      div.appendChild(button);
      view.appendChild(div);
  } catch (err) {
      console.log(err);
  }
};