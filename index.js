var app = new Vue({
    el: '#vue',
    data: {
        user:{
            "vendor_id":"a3wdhhlalp",
            "vendor_member_id":"HJCdtestrnd04"
        },
        access_token: '',
         leagurId:110287,
          islive:true,
          sse:"",
          events:[]
      },
    mounted(){
        this.login()
    },
    methods:{
        login(){
            // axios.post('https://api.wx7777.com/login',this.user).then(res=>{
            // 	consol.log(res)
            // })
            this.access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJISkNkdGVzdHJuZDA0IiwiU2l0ZUlkIjoiNDI1NDQwMCIsIlVtU3RhcnRUaW1lIjoiIiwiVW1FbmRUaW1lIjoiIiwibmJmIjoxNjYyNzg0OTUwLCJleHAiOjE2NjI3ODU1NTB9.jJaeOC98fr-39t_cdxV8yFLQ_S_9fSHQVNvtWMWqxJI"
            // this.GetSports()
            // this.GetLeagues()
            // this.startSse()
        },
        GetSports(){
            let query = {
                language:'cs',	//语言 cs 中文
                token:this.access_token,
            }
            let str = Object.keys(query).map(k=> k+'='+query[k]).join('&')
            this.sse = new EventSource('https://api.wx7777.com/sports/stream/v1/GetSports?'+str)
            this.sse.onmessage = (event)=>{
                let data = JSON.parse(event.data)
                console.log(data)
            }
        },
        GetLeagues(){
            let query = {
                language:'cs',	//语言 cs 中文
                query:"$filter=sporttype eq 1 and contains(leagueName,'世界杯')",		//足球
                token:this.access_token,
            }
            let str = Object.keys(query).map(k=> k+'='+query[k]).join('&')
            this.sse = new EventSource('https://api.wx7777.com/sports/stream/v1/GetLeagues?'+str)
            this.sse.onmessage = (event)=>{
                let data = JSON.parse(event.data)
                console.log(data)
            }
        },
        startSse(){
            let query = {
                language:'cs',	//语言 cs 中文
                token:this.access_token,
                // query:"$filter=leagueId eq 110287",		//世界杯，多次尝试没变，应该是固定的
                query:"$filter=sportType eq 1 and isLive eq true",		//世界杯，多次尝试没变，应该是固定的
                from:"2022-09-10"
            }
            let str = Object.keys(query).map(k=> k+'='+query[k]).join('&')
            this.sse = new EventSource('https://api.wx7777.com/sports/stream/v1/GetEvents?'+str)
            this.sse.onmessage = (event)=>{
                let data = {}
                    data = JSON.parse(event.data) 
                console.log(data)
            }
        }

    }
})