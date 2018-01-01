Vagrant.configure("2") do |config|
  config.vm.box = "puppetlabs/ubuntu-16.04-64-nocm"
  config.vm.synced_folder "./", "/vagrant"
  config.vm.network "public_network", bridge: "en0: Wi-Fi (AirPort)"
end
