all:
	cd dataowner && $(MAKE)
	cd datarequester && $(MAKE)
	cd idservice && $(MAKE)
	cd wallet && $(MAKE)
push:
	cd dataowner && $(MAKE) push
	cd datarequester && $(MAKE) push
	cd idservice && $(MAKE) push
	cd wallet && $(MAKE) push
