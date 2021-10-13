Index = {
  web3Provider: null,
  contracts: {},
  address: 0x0,
  ownAdress: 0x0,
  id: "sangiki82",

  init: async function () {
    await Init.init();
    //   Mypage.address = address;
    Index.bindEvents();
    await Index.getAccountList();
    //   Mypage.getPersonalFunction();
  },





  bindEvents: function () {
    $(document).on('click', '#create_mnemonic_button', Index.getMnemonic);
    $(document).on('click', '#create_wallet_button', Index.createWallet);
    $(document).on('click', '.remove_account', Index.deleteAccount);
    //   $(document).on('click', '.removehistory', Mypage.deleteMyItem);
    //   $(document).on('click', '.removeItem', Mypage.deleteItem);
    //   $(document).on('click', '.removeBlacklist', Mypage.deleteBlacklist);
    //   $(document).on('click', '.add_to_item_button', Mypage.registerItem);
    //   $(document).on('click', '.add_to_Blacklist_button', Mypage.registerBlacklist);
    //   $(document).on('click', '.withdrawal_button', Mypage.withdrawal);
  },

  getMnemonic: function () {

    $.ajax({
      url: 'http://localhost:3001/mnemonic',
      type: 'post',
      data: '',
      success: function (data) {

        $('#mnemonic_text').val(data.mnemonic);
      },
      error: function (request, status, error) {
        alert("code = " + request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
      },

    })

  },

  createWallet: function () {
    const mnemonic_val = $("#mnemonic_text").val();
    const user_password = $("#password").val();
    if (mnemonic_val == '') {
      alert('니모닉을 생성해 주세요.');
      return;
    }
    else if (user_password == '') {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    console.log("mnemonic_val ", mnemonic_val);
    console.log("user_password ", user_password);
    const param_data = { mnemonic: mnemonic_val, id: Index.id, password: user_password }


    $.ajax({
      url: 'http://localhost:3001/create_wallet',
      type: 'post',
      data: param_data,
      success: function (data) {
        alert('지갑을 생성하였습니다.');
        Index.getAccountList();
        $("#mnemonic_text").val('');
        $("#password").val('');
      },
      error: function (request, status, error) {
        alert("code = " + request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
      },

    })

  },

  getAccountList: function () {
    var itemrow = $('#account_list_content');
    var itemTemplate = $('#account_detail_content');
    var html = '';
    const param_data = { id: Index.id }
    $.ajax({
      url: 'http://localhost:3001/accountlist',
      type: 'get',
      data: param_data,
      success: function (data) {
        if (data.length == 0) {
          html += "<tr class='cart_item'>";
          html += "<td colspan='3'><center>등록된 계정이 없습니다.</center> </td>";
          html += "</tr>";
          itemrow.html(html);

        }
        for (var i = 0; i < data.length; i++) {
          itemTemplate.find('.remove_account').attr('data-id', data[i].id_index);
          // itemTemplate.find('.removeItem').attr('data-index', itemInfos.id);
          itemTemplate.find('.product-name').text(i + 1);
          itemTemplate.find('.product-address').attr('data-id', data[i].id_index);
          itemTemplate.find('.product-address').attr("onclick", "Index.sendAddress('"+data[i].address+"','"+data[i].file_path+"')");
          
          itemTemplate.find('.product-address').text(data[i].address);


          // var balance = web3.eth.getBalance(data[i].address);
          $.ajax({
            url: 'http://localhost:3001/balance',
            type: 'get',
            data: { address: data[i].address },
            async: false,
            success: function (data) {
              itemTemplate.find('.product-ether').text(web3.utils.fromWei(data.eth,'ether'));
              console.log(data.eth);
            },
            error: function (request, status, error) {
              alert("code = " + request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
            },

          })  
          console.log("aaa");
          html += '<tr class="cart_item">' + itemTemplate.html() + '</tr>';
          // console.log(balance);
        }


        itemrow.html(html);
      },
      error: function (request, status, error) {
        alert("code = " + request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
      },

    })

  },

  deleteAccount: function (event) {

    var itemcode = $(event.target).data('id');

    const param_data = { id: Index.id, id_index: itemcode }
    $.ajax({
      url: 'http://localhost:3001/remove',
      type: 'post',
      data: param_data,
      success: function (data) {
        if (data.response == 200) {
          alert('계정이 삭제 되었습니다.');
          Index.getAccountList();
        }
      },
      error: function (request, status, error) {
        alert("code = " + request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
      },

    })

  },

  sendAddress: function (account, file_path) {

    console.log(account);
    console.log(file_path);
    
    $('#send_address').val(account);
    $('#hidden_file_path').val(file_path);

  },

  sendEther: function () {

    console.log('hello');
    const send_address = $('#send_address').val();
    const receive_address = $('#recieve_address').val();
    const ether_value = $('#send_ether_amount').val();
    const password = $('#sendEther_password').val();
    const filePath = $('#hidden_file_path').val();

    const param_data = {
      send_address: send_address,
      receive_address: receive_address,
      ether_value: ether_value,
      password: password,
      filePath: filePath
    }

    console.log(param_data);

    $.ajax({
      url: 'http://localhost:3001/transaction',
      type: 'post',
      data: param_data,
      success: function (data) {
        if (data.response == 200) {
          alert('이더가 전송 되었습니다.');
          Index.getAccountList();
        } 
      },
      error: function (request, status, error) {
        alert("code = " + request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
      },

    })


  }








};

$(function () {
  $(window).load(function () {
    Index.init();
  });
});
