import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import useLocalStorage from 'react-use/lib/useLocalStorage';

type DataModel<T> = {
    init: boolean;
    data: T;
};

function useLocalStorageState<T = unknown>(key: string, initialValue?: T): [DataModel<T> | undefined, Dispatch<SetStateAction<T>>] {
    const [storage, setStorage] = useLocalStorage<T>(key, initialValue)
    const [state, setState] = useState<DataModel<T>>({
        init: false,
        data: initialValue
    })
    useEffect(() => {
        if (storage) {
            setState({
                init: true,
                data: storage
            })
        }
    }, [])
    const _setState: Dispatch<SetStateAction<T>> = (stateOrSetStateAction) => {
        const data = typeof stateOrSetStateAction === 'function' ? (stateOrSetStateAction as (arg: T) => T)(state.data) : stateOrSetStateAction
        setState({
            init: false,
            data
        })
        setStorage(data)
    }
    return [state, _setState];
}

export default useLocalStorageState;
