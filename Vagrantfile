Vagrant.configure("2") do |config|
  config.vm.box = "puppetlabs/ubuntu-16.04-64-nocm"
  config.vm.synced_folder "./", "/vagrant"
  config.vm.network "public_network", bridge: "en0: Wi-Fi (AirPort)"

  config.vm.provider :virtualbox do |vb|
    vb.gui  = false
    vb.customize ['modifyvm', :id, '--memory', 2048]
    vb.customize ['modifyvm', :id, '--cpus', 2]
  end
end
