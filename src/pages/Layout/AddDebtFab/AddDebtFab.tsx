import { useState } from 'react';
import { Plus, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

type DebtType = 'i-owe' | 'owes-me';

interface Props {
    onSelect: (type: DebtType) => void;
}


export default function AddDebtFab(props: Props) {
    const { onSelect } = props;
    const [expanded, setExpanded] = useState(false);
    console.log('FAB PROPS:', props);

    function handleSelect(type: DebtType) {
        console.log('clicked', type);
        setExpanded(false);  
        if (typeof onSelect === 'function') {
            onSelect(type);
        } else {
            console.error('AddDebtFab: onSelect is not a function. Props:', props);
        }
    }

    return (
        <div className="fixed bottom-20 lg:bottom-6 right-6 flex flex-col items-end gap-3 z-40">
            <div
                className={`flex flex-col items-end gap-2 transition-all duration-200 ${expanded ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
                    }`}
            >

                <button
                    type="button"
                    onClick={() => handleSelect('i-owe')}
                    className="flex items-center gap-2 group"
                >
                    <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-md group-hover:bg-gray-50 transition-colors whitespace-nowrap">
                        I Owe
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 shadow-lg group-hover:bg-red-600 transition-colors">
                        <ArrowUpRight className="h-5 w-5 text-white" />
                    </span>
                </button>
                
                <button
                    type="button"
                    onClick={() => handleSelect('owes-me')}
                    className="flex items-center gap-2 group"
                >
                    <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-md group-hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Owes Me
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 shadow-lg group-hover:bg-emerald-600 transition-colors">
                        <ArrowDownLeft className="h-5 w-5 text-white" />
                    </span>
                </button>
            </div>

            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200 ${expanded
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-900 hover:bg-gray-700'
                    }`}
            >
                <span
                    className={`transition-transform duration-200 ${expanded ? 'rotate-45' : 'rotate-0'}`}
                >
                    {expanded ? (
                        <X className="h-6 w-6 text-white" />
                    ) : (
                        <Plus className="h-6 w-6 text-white" />
                    )}
                </span>
            </button>
        </div>
    );
}
