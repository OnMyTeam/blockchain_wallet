async function mnemonic (data) {
    try {
        const mnemonic = data;
        const view = document.getElementById('mnemonic');
        view.innerHTML = '';
        const div = document.createElement('div');
        const span = document.createElement('span');
        const button = document.createElement('button');
        span.textContent = mnemonic;
        button.textContent = '니모닉으로 지갑 생성';
        button.addEventListener('click', async () => {
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

document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/mnemonic');
      const data = res.data;
      console.log('bb');
      mnemonic(data);
    } catch (err) {
      console.error(err);
    }
    e.target.username.value = '';
  });