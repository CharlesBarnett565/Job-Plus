(function() {
    // get all elements
    var oAvatar = document.getElementById('avatar'),
        oWelcomeMsg = document.getElementById('welcome-msg'),
        oLogoutBtn = document.getElementById('logout-link'),
        oLoginBtn = document.getElementById('login-btn'),
        oLoginForm = document.getElementById('login-form'),
        oLoginUsername = document.getElementById('username'),
        oLoginPwd = document.getElementById('password'),
        oLoginFormBtn = document.getElementById('login-form-btn'),
        oLoginErrorField = document.getElementById('login-error'),
        oRegisterBtn = document.getElementById('register-btn'),
        oRegisterForm = document.getElementById('register-form'),
        oRegisterUsername = document.getElementById('register-username'),
        oRegisterPwd = document.getElementById('register-password'),
        oRegisterFirstName = document.getElementById('register-first-name'),
        oRegisterLastName = document.getElementById('register-last-name'),
        oRegisterFormBtn = document.getElementById('register-form-btn'),
        oRegisterResultField = document.getElementById('register-result'),
        oNearbyBtn = document.getElementById('nearby-btn'),
        oFavBtn = document.getElementById('fav-btn'),
        oRecommendBtn = document.getElementById('recommend-btn'),
        oNavBtnBox = document.getElementsByClassName('main-nav')[0],
        oNavBtnList = document.getElementsByClassName('main-nav-btn'),
        oItemNav = document.getElementById('item-nav'),
        oItemList = document.getElementById('item-list'),
        oTpl = document.getElementById('tpl').innerHTML,

        // default data
        userId = '1111',
        userFullName = 'John',
        // lng = -122.08,
        // lat = 37.38,
        lng = -122,
        lat = 47,
        itemArr;
    // above this 是dom的读操作; step 1:

    // init
    function init() {
        // validate session
        validateSession();//验证用户有没有登录
        // bind event
        bindEvent();//然后来捆绑事件
    }

    function validateSession() {
        switchLoginRegister('login');
    }

    function bindEvent() {
        // switch between login and register
        oRegisterFormBtn.addEventListener('click', function(){
            switchLoginRegister('register')
        }, false);
        oLoginFormBtn.addEventListener('click', function() {
            switchLoginRegister('login')
        }, false);

        // click login button
        oLoginBtn.addEventListener('click', loginExecutor, false);

        // click register button
        oRegisterBtn.addEventListener('click', registerExecutor, false);
    }

    /**
     * API Login
     */
    function loginExecutor() {
        var username = oLoginUsername.value,
            password = oLoginPwd.value;

        if (username === "" || password == "") {
            oLoginErrorField.innerHTML = 'Please fill in all fields';
            return;
        }
        password = md5(username + md5(password));

        ajax({
            method: 'POST',
            url: './login',
            data: {
                user_id: username,
                password: password,
            },
            success: function (res) {
                if (res.status === 'OK') {
                    welcomeMsg(res);
                    fetchData();
                } else {
                    oLoginErrorField.innerHTML = 'Invalid username or password';
                }
            },
            error: function () {
                throw new Error('Invalid username or password');
            }
        })
    }

    /**
     * API Register
     */
    function registerExecutor() {
        var username = oRegisterUsername.value,
            password = oRegisterPwd.value,
            firstName = oRegisterFirstName.value,
            lastName = oRegisterLastName.value;

        if (username === "" || password == "" || firstName === ""
            || lastName === "") {
            oRegisterResultField.innerHTML = 'Please fill in all fields';
            return;
        }

        if (username.match(/^[a-z0-9_]+$/) === null) {
            oRegisterResultField.innerHTML = 'Invalid username';
            return;
        }
        password = md5(username + md5(password));

        ajax({
            method: 'POST',
            url: './register',
            data: {
                user_id : username,
                password : password,
                first_name : firstName,
                last_name : lastName,
            },
            success: function (res) {
                if (res.status === 'OK' || res.result === 'OK') {
                    oRegisterResultField.innerHTML = 'Successfully registered!'
                } else {
                    oRegisterResultField.innerHTML = 'User already existed!'
                }
            },
            error: function () {
                //show login error
                throw new Error('Failed to register');
            }
        })
    }

    //Step 2: 隐藏其他部分，显示正常login界面;切换你是想登录还是切换;
    function switchLoginRegister(name) {//这个函数是切换前端显示Login 和 register界面的;
        // hide header elements
        showOrHideElement(oAvatar, 'none');
        showOrHideElement(oWelcomeMsg, 'none');
        showOrHideElement(oLogoutBtn, 'none');

        // hide item list area  //这里是隐藏工作list那里;
        showOrHideElement(oItemNav, 'none');
        showOrHideElement(oItemList, 'none');

        if(name === 'login') {
            // hide register form
            showOrHideElement(oRegisterForm, 'none');
            // clear register error
            oRegisterResultField.innerHTML = ''

            // show login form
            showOrHideElement(oLoginForm, 'block');

        } else {
            // hide login form
            showOrHideElement(oLoginForm, 'none');
            // clear login error if existed
            oLoginErrorField.innerHTML = '';

            // show register form
            showOrHideElement(oRegisterForm, 'block');
        }
    }

    function showOrHideElement(ele, style) {
        ele.style.display = style;
    }

    function ajax(opt) {//opt这里是option的缩写，//这里是定义opt这个object上携带的数据(信息);
        var opt = opt || {},//这里就是看opt是不是undefine,如果不是就把||前面的值赋值给=号左边的参数；如果为空就把||后面的赋值;
            method = (opt.method || 'GET').toUpperCase(),
            url = opt.url,
            data = opt.data || null,
            success = opt.success || function () {
            },
            error = opt.error || function () {
            },
            xhr = new XMLHttpRequest();

        if (!url) {
            throw new Error('missing url');
        }

        xhr.open(method, url, true);

        if (!data) {//如果没有data就直接发送request;(logout request);
            xhr.send();
        } else {
            xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
            xhr.send(JSON.stringify(data));//把json 压缩成string之后传输;
        }

        xhr.onload = function () {//这里要注意，因为是async执行；146行send()以后，不会等待，程序会直接跳到152行
            //因为现在还没有response,只是给xhr.onload赋值一个函数，function,具体response目前不知道；
            //等到send()回来以后就知道xhr的status,然后response才会给出相应的结果;
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText))
            } else {
                error()
            }
        }

        xhr.onerror = function () {//这里就是xhr request发送失败，所以就告诉用户出错了;
            throw new Error('The request could not be completed.')
        }
    }

    function welcomeMsg(info) {//step3:  fetch geolocation + nearby data
        userId = info.user_id || userId;
        userFullName = info.name || userFullName;
        oWelcomeMsg.innerHTML = 'Welcome ' + userFullName;

        // show welcome, avatar, item area, logout btn
        showOrHideElement(oWelcomeMsg, 'block');//block代表显示，none代表隐藏;
        showOrHideElement(oAvatar, 'block');
        showOrHideElement(oItemNav, 'block');
        showOrHideElement(oItemList, 'block');
        showOrHideElement(oLogoutBtn, 'block');

        // hide login form
        showOrHideElement(oLoginForm, 'none');
    }

    function fetchData() {//step3:  fetch geolocation + nearby data
        // get geo-location info
        initGeo(loadNearbyData);
    }

    function initGeo(cb) {//step3:  fetch geolocation + nearby data
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    // lat = position.coords.latitude || lat;
                    // lng = position.coords.longitude || lng;
                    cb();
                },
                function () {
                    throw new Error('Geo location fetch failed!!')
                }, {
                    maximumAge: 60000//这里是如果call了这个function得到一个结果，60000ms以内都会使用这个结果
                    //如果过了这个时间才会重新call function更新地理位置;
                });
            // show loading message
            oItemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i>Retrieving your location...</p>';
        } else {
            throw new Error('Your browser does not support navigator!!')
        }
    }

    function loadNearbyData() {//step3:  fetch geolocation + nearby data
        // active side bar buttons
        activeBtn('nearby-btn');

        var opt = {
            method: 'GET',
            url: './search?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
            data: null,
            message: 'nearby'
        }
        serverExecutor(opt);
    }

    function serverExecutor(opt) { //add helper function
        oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>Loading ' + opt.message + ' item...</p>';
        ajax({
            method: opt.method,
            url: opt.url,
            data: opt.data,
            success: function (res) {
                // case1: data set is empty
                if (!res || res.length === 0) {
                    oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>No ' + opt.message + ' item!</p>';
                } else {
                    // case2: data set is not empty
                    render(res);
                    itemArr = res;
                }
            },
            error: function () {
                throw new Error('No ' + opt.message + ' items!');
            }
        })
    }

    function activeBtn(btnId) {
        var len = oNavBtnList.length;
        for (var i = 0; i < len; i++) {
            oNavBtnList[i].className = 'main-nav-btn';
        }
        var btn = document.getElementById(btnId);
        btn.className += ' active';
    }
    // Step6: Add Register + Favorite Items + Recommendation
    function bindEvent() {
        // switch between login and register
        oRegisterFormBtn.addEventListener('click', function(){
            switchLoginRegister('register')
        }, false);
        oLoginFormBtn.addEventListener('click', function() {
            switchLoginRegister('login')
        }, false);
        // click login button
        oLoginBtn.addEventListener('click', loginExecutor, false);

        // click register button
        oRegisterBtn.addEventListener('click', registerExecutor, false);

        oNearbyBtn.addEventListener('click', loadNearbyData, false);
        oFavBtn.addEventListener('click', loadFavoriteItems, false);
        oRecommendBtn.addEventListener('click', loadRecommendedItems, false);
        oItemList.addEventListener('click', changeFavoriteItem, false);
    }

    /**
     * API Load Favorite Items
     */
    function loadFavoriteItems() {
        activeBtn('fav-btn');
        var opt = {
            method: 'GET',
            url: './history?user_id=' + userId,
            data: null,
            message: 'favorite'
        }
        serverExecutor(opt);
    }

    /**
     * API Load Recommended Items
     */
    function loadRecommendedItems() {
        activeBtn('recommend-btn');
        var opt = {
            method: 'GET',
            url: './recommendation?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
            data: null,
            message: 'recommended'
        }
        serverExecutor(opt);
    }

    /**
     * Render Data
     * @param data
     */
    function render(data) {
        var len = data.length,
            list = '',
            item;
        for (var i = 0; i < len; i++) {
            item = data[i];
            list += oTpl.replace(/{{(.*?)}}/gmi, function (node, key) {
                console.log(key)
                if(key === 'company_logo') {
                    return item[key] || 'https://via.placeholder.com/100';
                }
                if (key === 'location') {
                    return item[key].replace(/,/g, '<br/>').replace(/\"/g, '');
                }
                if (key === 'favorite') {
                    return item[key] ? "fa fa-heart" : "fa fa-heart-o";
                }
                return item[key];
            })
        }
        oItemList.innerHTML = list;
    }

    /**
     * API Change Favorite Item
     * @param evt
     */
    function changeFavoriteItem(evt) {
        var tar = evt.target,
            oParent = tar.parentElement;

        if (oParent && oParent.className === 'fav-link') {
            console.log('change ...')
            var oCurLi = oParent.parentElement,
                classname = tar.className,
                isFavorite = classname === 'fa fa-heart' ? true : false,
                oItems = oItemList.getElementsByClassName('item'),
                index = Array.prototype.indexOf.call(oItems, oCurLi),
                url = './history',
                req = {
                    user_id: userId,
                    favorite: itemArr[index]
                };
            var method = !isFavorite ? 'POST' : 'DELETE';

            ajax({
                method: method,
                url: url,
                data: req,
                success: function (res) {
                    if (res.status === 'OK' || res.result === 'SUCCESS') {
                        tar.className = !isFavorite ? 'fa fa-heart' : 'fa fa-heart-o';
                    } else {
                        throw new Error('Change Favorite failed!')
                    }
                },
                error: function () {
                    throw new Error('Change Favorite failed!')
                }
            })
        }
    }

    init();
})();
