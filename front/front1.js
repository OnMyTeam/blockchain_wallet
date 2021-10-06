async function getUser() { // 로딩 시 사용자 가져오는 함수
    try {
      const res = await axios.get('/users');
      const users = res.data;
      const list = document.getElementById('list');
      list.innerHTML = '';
      // 사용자마다 반복적으로 화면 표시 및 이벤트 연결
      Object.keys(users).map(function (key) {
        const userDiv = document.createElement('div');
        const span1 = document.createElement('span');
        const span2 = document.createElement('span');
        span1.textContent = `계정 주소: ${users[key]};`
        span2.textContent = '5678'

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
        userDiv.appendChild(span1);
        userDiv.appendChild(span2);
        userDiv.appendChild(remove);
        list.appendChild(userDiv);
        console.log(res.data);
      });
    } catch (err) {
      console.error(err);
    }
  }
  
  window.onload = getUser; // 화면 로딩 시 getUser 호출
  // 폼 제출(submit) 시 실행
  document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    try {
      console.log('aaa');
      await axios.post('/user', { name });
      getUser();
    } catch (err) {
      console.error(err);
    }
    e.target.username.value = '';
  });
