Index = {
    web3Provider: null,
    contracts: {},
    address: 0x0,
    ownAdress: 0x0,
    ownerYN: "N",
  
    init: async function() {
      await Init.init();
    //   Mypage.address = address;
    Index.getAccountList();
    //   Mypage.getPersonalFunction();
    },
  
    getAccountList: function() {
        // Index.getGradeInfo();
        // Index.getAccountInfo();
        // Index.getTokenInfo();
        Index.bindEvents();
    },
  
    getPersonalFunction: function() {
      Mypage.getOwner();
      Mypage.getItemList();
      Mypage.getMemberList();
      Mypage.getBlacklist();
    },
    
    getGradeInfo: function() {
  
      Init.membershipInstance.getGrade({ from: Mypage.address }).then(function (result) {
        if (result == 'Bronze') {
          $('#accountGrade').html("<font color='bronze'><b>Bronze</b></font>");
        } else if (result == 'Silver') {
          $('#accountGrade').html("<font color='silver'><b>Silver</b></font>");
        } else if (result == 'Gold') {
          $('#accountGrade').html("<font color='gold'><b>Gold</b></font>");
        }
      });
    },
  
    getAccountInfo: function() {
      document.getElementById('accountAddr').innerHTML = Mypage.address;
      web3.eth.getBalance(Mypage.address, function (error, balance) {
        var ether = parseInt(web3.utils.fromWei(balance, "ether"));
        document.getElementById('ethValue').innerHTML = ether.toFixed(2) + " ETH";
      });
    },
  
    getTokenInfo: function() {
      var account = document.getElementById('accountAddr').innerText;
      Init.OSDCTokenInstance.balanceOf(account, { from: account }).then(function (result) {
        var token = result.words[0]
        document.getElementById('tokenValue').innerText = token;
      });
    },
  
    getOwner: function() {
      Init.membershipInstance.owner.call().then(function (result) {
        if (result == Mypage.address) {
          Mypage.ownerYN = 'Y';
          $("#accountAddrAdmin").text('Account Address(Seller)');
          $("#itemRegister").css("display", "block");
          $("#itemRegisterList").css("display", "block");
          $("#memberList").css("display", "block");
          $("#blacklist").css("display", "block");
        }
        else {
          $("#accountAddrAdmin").text('Account Address(Buyer)');
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    },
  
    bindEvents: function() {
      $(document).on('click', '#create_mnemonic_button', Index.getMnemonic);
      $(document).on('click', '#create_wallet_button', Index.createWallet);
    //   $(document).on('click', '.removehistory', Mypage.deleteMyItem);
    //   $(document).on('click', '.removeItem', Mypage.deleteItem);
    //   $(document).on('click', '.removeBlacklist', Mypage.deleteBlacklist);
    //   $(document).on('click', '.add_to_item_button', Mypage.registerItem);
    //   $(document).on('click', '.add_to_Blacklist_button', Mypage.registerBlacklist);
    //   $(document).on('click', '.withdrawal_button', Mypage.withdrawal);
    },
  
    getMnemonic: function() {

        $.ajax({
            url:'http://localhost:3001/mnemonic',
            type:'post',
            data:'',
            success:function(data){
                
                $('#mnemonic_text').val(data.mnemonic);
            },
            error:function(request,status,error){
                alert("code = "+ request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
            },
        
        })

    },

    createWallet: function() {
        const mnemonic_val = $("#mnemonic_text").val();
        const user_password = $("#password").val();
        if (mnemonic_val == ''){
            alert('니모닉을 생성해 주세요.');
            return;
        }
        else if (user_password == ''){
            alert('비밀번호를 입력해주세요.');
            return;
        }
        console.log("mnemonic_val ",mnemonic_val);
        console.log("user_password ",user_password);
        const param_data = { mnemonic : mnemonic_val, id: 'sangiki82', password : user_password}


        $.ajax({
            url:'http://localhost:3001/create_wallet',
            type:'post',
            data: param_data,
            success:function(data){
                alert('지갑을 생성하였습니다.');
                $("#mnemonic_text").val('');
                $("#password").val('');
            },
            error:function(request,status,error){
                alert("code = "+ request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
            },
        
        })

    },  
    registerBlacklist: function(event) {
      var account = $(event.target).data('address');
  
      Init.membershipInstance.setBlacklist(account, { from: Mypage.address }).then(function (result) {
        Mypage.getBlacklist();
      }).catch(function (error) {
        if (error.message == 'VM Exception while processing transaction: revert already blacklist') {
          alert('Already register blacklist');
        }
        console.log(error.message);
      });
    },
    
    getMemberList: function() {
      var itemrow = $('#memberListContent');
      var itemTemplate = $('#detailmemberListContent');
      var html = '';
  
      Init.membershipInstance.getMemberList().then(function (list) {
        for (var i = 0; i < list.length; i++) {
          // console.log("list[i]" + Mypage.address);
          if (list[i] != Mypage.address || list[i] != 0x0 ) {
            itemTemplate.find('.add_to_Blacklist_button').attr('data-id', i);
            itemTemplate.find('.add_to_Blacklist_button').attr('data-address', list[i]);
            itemTemplate.find('.product-name').text(list[i]);
  
            html += '<tr class="cart_item">' + itemTemplate.html() + '</tr>';
          }
        }
        itemrow.html(html);
      });
    },
  
    getBlacklist: function() {
      var itemrow = $('#BlacklistContent');
      var itemTemplate = $('#detailBlacklistContent');
      var html = '';
      
      Init.membershipInstance.getBlacklist().then(function (list) {
        for (var i = 0; i < list.length; i++) {
          if (list[i] != 0x0) {
  
            itemTemplate.find('.removeBlacklist').attr('data-id', i);
            itemTemplate.find('.removeBlacklist').attr('data-address', list[i]);
            itemTemplate.find('.product-name').text(list[i]);
  
            html += '<tr class="cart_item">' + itemTemplate.html() + '</tr>';
          }
        }
        itemrow.html(html);
      });
    },
  
    deleteBlacklist: function() {
      var index = $(event.target).data('id');
      var address = $(event.target).data('address');
  
      Init.membershipInstance.deleteBlacklist(address, index, { from: Mypage.address }).then(function (result) {
        Mypage.getBlacklist();
      }).catch(function (error) {
        console.log(error);
      })
    },
  
    deleteMyItem: function(event) {
      var index = $(event.target).data('id');
  
      Init.shoppingInstance.deleteMyItem(index, { from: Mypage.address }).then(function (result) {
        Mypage.getMyItemList();
      }).catch(function (error) {
        console.log(error);
      })
    },
  
    deleteItem: function(event) {
      var itemcode = $(event.target).data('itemcode');
      console.log(event.target) ;
      console.log(itemcode);
      
      Init.itemInstance.deleteItem(itemcode, { from: Mypage.address, gas: 3000000 }).then(function (result) {
        alert('Success!');
        Mypage.getItemList();
      }).catch(function (error) {
        console.log(error);
      })
    },
  
    getItemList: function() {
      var itemrow = $('#ItemCotent');
      var itemTemplate = $('#detailItemContent');
      var html = '';
     
      Init.itemInstance.getAllItems({ from: Mypage.address, gas: 3000000 }).then(function (result) {
        const JSONItemlist = JSON.parse(result);
  
        if (JSONItemlist[0].itemCode == 9999) {
          html += "<tr class='cart_item'>";
          html += "<td colspan='4'><center><img src='public/images/no_product.png'/></center> </td>";
          html += "</tr>";
          itemrow.html(html);
          return;
        }
        
        for (i = 0; i<JSONItemlist.length; i++) {
          
          var itemInfos = JSONItemlist[i];
          
          if(itemInfos.itemCode == 9999){ break;}
          itemTemplate.find('.shop_thumbnail').attr('src', 'public/images/' + itemInfos.imgpath);
          itemTemplate.find('.removeItem').attr('data-itemcode', itemInfos.itemCode);
          // itemTemplate.find('.removeItem').attr('data-index', itemInfos.id);
          itemTemplate.find('.product-name').text(itemInfos.name);
          itemTemplate.find('.product-price').text(itemInfos.cost + ' osdc');
  
          html += '<tr class="cart_item">' + itemTemplate.html() + '</tr>';
        }
        itemrow.html(html);
        Mypage.getMyItemList();
      }).catch(function (err) {
        console.log(err.message);
      });
    },
    
    getMyItemList: function() {
      var itemrow = $('#historyContent');
      var itemTemplate = $('#historyDetailContent');
  
      var html = '';
      Init.shoppingInstance.getMyAllItems({ from: Mypage.address, gas: 3000000 }).then(function (result) {
        console.log(JSON.parse(result));
        const JSONItemlist = JSON.parse(result);
        if (JSONItemlist[0].itemCode == 9999) {
          html += "<tr class='cart_item'>";
          html += "<td colspan='4'><center><img src='public/images/no_product.png'/></center> </td>";
          html += "</tr>";
        }
        
        for (i = 0; i < JSONItemlist.length; i++) {
          if (JSONItemlist[i].itemCode == 9999) { continue; }
          var itemInfos = JSONItemlist[i];
  
          itemTemplate.find('.shop_thumbnail').attr('src', 'public/images/' + itemInfos.imgpath);
          itemTemplate.find('.removehistory').attr('data-id', itemInfos.id);
          itemTemplate.find('.product-name').text(itemInfos.name);
          itemTemplate.find('.product-price').text(itemInfos.cost + ' osdc');
          html += '<tr class="cart_item">' + itemTemplate.html() + '</tr>';
        }
        itemrow.html(html);
      }).catch(function (err) {
        console.log(err.message);
      });
    },
  
    registerItem: function() {
      var imgnum = Math.floor((Math.random() * 4)) + 1;
      var name = $('#ItemName').val();
      var cost = $('#ItemCost').val();
      var imgfile = 'product-' + imgnum + '.jpg';
  
      Init.itemInstance.registerItem(name, imgfile, cost, { from: Mypage.address, gas: 3000000 }).then(function (result) {
        alert('Success!');
        Mypage.getItemList();
      }).catch(function(error) {
        console.log(error);
      });
    },
  
    withdrawal: function() {
      Init.shoppingInstance.withdrawal({ from: Mypage.address, gas: 3000000 }).then(function (result) {
        alert('Success!');
        location.href = '/';
      }).catch(function (error) {
        console.log(error);
      });
    }
  };
  
  $(function() {
    $(window).load(function() {
      Index.init();
    });
  });
  