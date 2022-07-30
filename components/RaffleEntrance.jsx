import { abi, contractAddresses } from "../constants/index"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { Moralis } from "moralis"
import { useNotification } from "web3uikit"



export default function RaffleEntrance() {

    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()

    const chainId = parseInt(chainIdHex)

    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entryFee, setEntryFee] = useState("0")
 
    const [numberOfParticipants, setNumberOfParticipants] = useState("0")

    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()



    const {runContractFunction: enterRaffle, isLoading, isFetching} = useWeb3Contract({

        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entryFee
    })

    const {runContractFunction: getEntryAmount} = useWeb3Contract({

        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntryAmount",
        params: {}
    })

    const {runContractFunction: getNumberOfParticipants} = useWeb3Contract({

        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfParticipants",
        params: {}
    })

    const {runContractFunction: getRecentWinner} = useWeb3Contract({

        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {}
    })




    async function updateUIValues() {

        const entryFeeFromCall = (await getEntryAmount()).toString()

        const numberOfParticipantsFromCall = (await getNumberOfParticipants()).toString()

        const recentWinnerFromCall = (await getRecentWinner()).toString()

        setEntryFee(entryFeeFromCall)

        setNumberOfParticipants(numberOfParticipantsFromCall)

        setRecentWinner(recentWinnerFromCall)
    }



    useEffect(() => {

        if(isWeb3Enabled) {

            updateUIValues()
        }

    }, [isWeb3Enabled])




    const handleSuccess = async function(tx) {

        try{

            await tx

            handleNewNotification(tx)

            updateUIValues()

        } catch(error) {

            console.log(error)
        }
    }



    const handleNewNotification = function() {

        dispatch({

            type: "info",
            message: "Transaction Successfull",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell"
        })
    }




    return (

        <div className="p-5">

            {raffleAddress ? 
             <div>

                <button className="bg-blue-500 hover:bg-blue-700 text-white text-bold py-2 px-4 rounded ml-auto" onClick = {async() => { await enterRaffle({onComplete: handleSuccess, onError: (error) => console.log(error)}) }} disabled = {isLoading || isFetching}>{isLoading || isFetching ? (<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>) : (<div>Enter Raffle</div>)}</button>        


                <div className="font-medium">Entry Fee: ~ {Moralis.Units.FromWei(entryFee)} ETH</div>

                <div className="font-medium">Number Of Participants in Raffle: ~ {numberOfParticipants}</div>

                <div className="font-medium">Previous Raffle Winner Was: ~ {recentWinner}</div>


            </div>
            
            : <div className="font-bold">No Raffle Address Detected</div>
            }


        </div>

        
    )
}