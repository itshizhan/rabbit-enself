export default {
    state: {
        exportTree:[]
    },
    mutations: {
        MUT_EXPORT_TREE: (state, tree) => {
                console.log("MUT_EXPORT_TREE...");
                console.log(tree);
                state["exportTree"] = tree;
         }
    },
    actions: {
        SET_EXPORT_TREE({
            commit,
            state
        }, tree) {
            commit("MUT_EXPORT_TREE",tree)
        }
    }
}