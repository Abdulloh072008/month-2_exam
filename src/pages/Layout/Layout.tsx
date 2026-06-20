    import { Outlet } from "react-router"
    import Sidebar from "./Sidebar/Sidebar"
    import { Header } from "./Header/Header"
    import AddDebtFab from "./AddDebtFab/AddDebtFab"
import { useDialogStore } from "../../store/Dialog/DialogStore"

    const Layout = () => {
        const { openAddDebt } = useDialogStore();
        return (
            <>
                <section className="pt-14 md:pl-60 pb-16 md:pb-0">
                    <Header />
                    <div className="flex max-w-[1600px] mx-auto ">
                        <Sidebar />
                        <Outlet />
                    </div>
                    <AddDebtFab onSelect={openAddDebt}/>
                </section>
            </>
        )
    }

    export default Layout