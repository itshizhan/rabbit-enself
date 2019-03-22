export default {
    state: {
        actName:''
    },
    mutations: {
        SET_MAINTAIN_DATA: (state, act) => {
                console.log("SET_MAINTAIN_DATA...");
                console.log(act);
                state["actName"] = act;
         }
    },
    actions: {
        SET_MAINTAIN({
            commit,
            state
        }, act) {
            commit("SET_MAINTAIN_DATA",act)
        }
    }
}