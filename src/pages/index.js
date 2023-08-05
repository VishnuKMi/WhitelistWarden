import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import { providers, Contract } from 'ethers'
import { useEffect, useRef, useState, useCallback } from 'react'
import { WHITELIST_CONTRACT_ADDRESS, abi } from '../constantIndex'

export default function Home () {
  const [walletConnected, setWalletConnected] = useState(false)
  const [joinedWhitelist, setJoinedWhitelist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0)
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork()
    if (chainId !== 11155111) {
      window.alert('Change the network to Sepolia')
      throw new Error('Change network to Sepolia')
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }
    return web3Provider
  }

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )
      const tx = await whitelistContract.addAddressToWhitelist()
      setLoading(true)
      await tx.wait()
      setLoading(false)
      await getNumberOfWhitelisted()
      setJoinedWhitelist(true)
    } catch (err) {
      console.error(err)
    }
  }

  const getNumberOfWhitelisted = useCallback(async () => {
    try {
      const provider = await getProviderOrSigner()
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      )
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted()
      setNumberOfWhitelisted(_numberOfWhitelisted)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const checkIfAddressInWhitelist = useCallback(async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )
      const address = await signer.getAddress()
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      )
      setJoinedWhitelist(_joinedWhitelist)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const checkAndSetWhitelistInfo = useCallback(async () => {
    await checkIfAddressInWhitelist()
    await getNumberOfWhitelisted()
  }, [checkIfAddressInWhitelist, getNumberOfWhitelisted])

  const connectWalletCallback = useCallback(async () => {
    try {
      const providerOrSigner = await getProviderOrSigner()
      setWalletConnected(true)

      await checkAndSetWhitelistInfo()
    } catch (err) {
      console.error(err)
    }
  }, [checkAndSetWhitelistInfo])

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWalletCallback()
    }
  }, [walletConnected, connectWalletCallback])

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        )
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        )
      }
    } else {
      return (
        <button onClick={connectWalletCallback} className={styles.button}>
          Connect your wallet
        </button>
      )
    }
  }

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name='description' content='Whitelist-Dapp' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to BlockMaxi&#39;s Inventory!
          </h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            It&#39;s an NFT collection for CryptoHeads 💀
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <Image alt='image' className={styles.image} src='./crypto-devs.svg' />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by BlockMaxi</footer>
    </div>
  )
}
