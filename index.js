

var app = new Vue({
    el: '#vue',
    data() {
        return {
            // https://www.sojson.com/http/test.html
            user: {
                "vendor_id": "a3wdhhlalp",
                "vendor_member_id": "HJCdtestrnd04"
            },
            access_token: '',
            WorldCup:false,  //是否是世界杯
            leagurId: 110287,   //世界杯ID 好像不会变
            isLive: true,
            sse: "",
            events: [],
            markets: [],
            选中: {},
            bettypeId:5,
            checkedType: {},
            bettypeList: [
                {
                    i: 5, name: '全场, 独赢盘', 投注选项: { 1: () => this.选中.teamInfo.homeName, x: () => '和局', 2: () => this.选中.teamInfo.awayName }
                },
                {
                    i: 1, name: '让球', 投注选项: { h: () => this.选中.teamInfo.homeName, a: () => this.选中.teamInfo.awayName }
                },
                {
                    i: 2, name: '单双盘', 投注选项: { h: () => "单", a: () => "双" }
                },
                {
                    i: 3, name: '大小盘', 投注选项: { h: () => "大", a: () => "小" }
                },
                {
                    i: 6, name: '总进球', 投注选项: {
                        '0-1': () => '0-1 球',
                        '2-3': () => "2-3 球",
                        "4-6": () => "4-6 球",
                        "7-over": () => "7 球以上"
                    }
                },
                {
                    i: 7, name: '上半场, 让球', 投注选项: { h:()=>this.选中.teamInfo.homeName,a:()=>this.选中.teamInfo.awayName } 
                },
                { 
                    i: 8, name: '上半场, 大小盘', 投注选项: {
                        h:()=>'大',
                        a:()=>'小'
                    }
                }
            ]
        }
    },
    computed: {
        mark() {
            if (!this.选中.eventId) return { selections: [] }
            let obj = this.markets.find(x => x.eventId == this.选中.eventId && x.isLive == this.isLive)
            if (!obj) return { selections: [] }
            return obj
        }
    },
    mounted() {
        this.bettypeId = this.bettypeList[0].i
        this.checkedType = this.bettypeList[0]
        this.init()
    },
    methods: {
        changeQuery(){
            this.sse.close()
            this.init()
        },
        changeBetType(){
            this.sse.close()
            this.checkedType = this.bettypeList.find(x=>x.i==this.bettypeId)
            this.init()
        },
        init() {
            this.events = []
            this.markets = []
            this.选中 = {}

            // axios.post('https://api.wx7777.com/login',this.user).then(res=>{
            // 	consol.log(res)
            // })
            if (!this.access_token) {
                this.access_token = sessionStorage.access_token
            } else {
                sessionStorage.access_token = this.access_token
            }
            if (!this.access_token) return
            // 下面两个是获取类型可以不用
            // this.GetSports()    
            // this.GetLeagues()   
            this.events = []
            this.markets = []
            this.startSse()
        },
        GetSports() {
            let query = {
                language: 'cs',	//语言 cs 中文
                token: this.access_token,
            }
            let str = Object.keys(query).map(k => k + '=' + query[k]).join('&')
            this.sse = new EventSource('https://api.wx7777.com/sports/stream/v1/GetSports?' + str)
            this.sse.onmessage = (event) => {
                let data = JSON.parse(event.data)
                console.log(data)
            }
        },
        GetLeagues() {
            let query = {
                language: 'cs',	//语言 cs 中文
                query: "$filter=sporttype eq 1 and contains(leagueName,'世界杯')",		//足球
                token: this.access_token,
            }
            let str = Object.keys(query).map(k => k + '=' + query[k]).join('&')
            this.sse = new EventSource('https://api.wx7777.com/sports/stream/v1/GetLeagues?' + str)
            this.sse.onmessage = (event) => {
                let data = JSON.parse(event.data)
                console.log(data)
            }
        },
        startSse() {
            let query = (this.WorldCup ? ' and leagueId eq 110287' : '') + (this.isLive ? ' and isLive eq true' : '')
            let q = {
                language: 'cs',	//语言 cs 中文
                token: this.access_token,
                // query:"$filter=leagueId eq 110287",		//世界杯，多次尝试没变，应该是固定的
                query: "$filter=sportType eq 1"+query,		//世界杯，多次尝试没变，应该是固定的
                // from: "2022-09-10",  //时间
                includeMarkets: "$filter=bettype eq "+this.bettypeId,    //独赢 5 让球 1
            }
            let str = Object.keys(q).map(k => k + '=' + q[k]).join('&')
            this.sse = new EventSource('https://api.wx7777.com/sports/stream/v1/GetEvents?' + str)
           
            this.sse.onmessage = (event) => {
                let data = {}
                try {
                    data = JSON.parse(event.data)
                } catch (error) { }
                let events = data.payload.events
                let markets = data.payload.markets
                this.events.push(...events.add)
                this.markets.push(...markets.add)

                events.change.map(x=>{
                    let i = this.events.findIndex(e=>e.eventId==x.eventId)
                    if(i) {
                        this.events[i] = {...this.events[i],...x}
                    }
                })
                events.remove.map(x=>{
                    let index = this.events.findIndex(e=>e.eventId==x.eventId)
                    if(index!=-1) this.events.splice(index,1)
                })
                

                markets.change.map(x=>{
                    let i = this.markets.findIndex(e=>e.marketId==x.marketId)
                    if(i!=-1) {
                        this.markets[i] = {...this.markets[i],...x}
                    }
                })
                markets.remove.map(x=>{
                    let index = this.markets.findIndex(e=>e.marketId==x.marketId)
                    if(index!=-1) this.markets.splice(index,1)
                })



                if (!this.选中.eventId && this.events.length > 0) {
                    this.选中 = this.events[0]
                }
            }
            this.sse.onerror=(err)=>{
                console.log(err)
                // alert('应该是token失效了')
            }
        }

    }
})